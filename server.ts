import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import mammoth from 'mammoth';
import { createServer as createViteServer } from 'vite';
import { analyzeResumeNLP } from './server/nlpEngine';
import { generateAIDeepReview, rewriteBulletWithGemini } from './server/geminiService';
import { JobDescription, SkillsData, BenchmarkResume, SampleResume } from './src/types';

// Safe directory resolution for both ESM (tsx dev) and CommonJS (esbuild bundle in production)
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Static Data File Paths
const getDataPath = (...parts: string[]) => {
  const p1 = path.join(process.cwd(), 'data', ...parts);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(currentDir, 'data', ...parts);
  if (fs.existsSync(p2)) return p2;
  const p3 = path.join(currentDir, '..', 'data', ...parts);
  if (fs.existsSync(p3)) return p3;
  return p1;
};

const JOBS_FILE = getDataPath('jobs.json');
const SKILLS_FILE = getDataPath('skills.json');
const BENCHMARKS_DIR = getDataPath('benchmarks');
const SAMPLES_FILE = getDataPath('sample_resumes.json');

// Helper to safely load JSON files
function loadJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return fallback;
}

// Helper to load all benchmarks from /data/benchmarks
function loadBenchmarks(): BenchmarkResume[] {
  try {
    if (!fs.existsSync(BENCHMARKS_DIR)) return [];
    const files = fs.readdirSync(BENCHMARKS_DIR).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const content = fs.readFileSync(path.join(BENCHMARKS_DIR, file), 'utf-8');
      return JSON.parse(content) as BenchmarkResume;
    });
  } catch (err) {
    console.error('Error loading benchmarks directory:', err);
    return [];
  }
}

// PDF Text Extraction Helper (Safe fallback if binary bindings vary)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to support various CJS/ESM packagers & pdf-parse versions (v1 & v2)
    const pdfParseModule: any = await import('pdf-parse');
    if (pdfParseModule?.PDFParse) {
      const parser = new pdfParseModule.PDFParse({ data: buffer });
      const data = await parser.getText();
      if (data && typeof data.text === 'string' && data.text.trim()) {
        return data.text;
      }
      if (data && Array.isArray(data.pages)) {
        return data.pages.map((p: any) => p.text || '').join('\n');
      }
    } else if (typeof pdfParseModule?.default === 'function') {
      const data = await pdfParseModule.default(buffer);
      if (data && data.text) return data.text;
    } else if (typeof pdfParseModule === 'function') {
      const data = await pdfParseModule(buffer);
      if (data && data.text) return data.text;
    }
  } catch (error) {
    console.warn('pdf-parse failed, attempting text stream parsing:', error);
  }

  // Fallback: simple text extraction from raw buffer strings
  try {
    const rawString = buffer.toString('binary');
    const matches = rawString.match(/\((.*?)\)\s*Tj/g) || [];
    if (matches.length > 0) {
      return matches.map(m => m.replace(/[()]/g, '').replace(/\s*Tj$/, '')).join(' ');
    }
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  } catch (fallbackError) {
    console.error('PDF fallback parsing error:', fallbackError);
    return '';
  }
}

// DOCX Text Extraction Helper
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }
}

// ==========================================
// API ROUTES
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 1. Get Job Descriptions
app.get('/api/jobs', (req, res) => {
  const jobs = loadJsonFile<JobDescription[]>(JOBS_FILE, []);
  res.json(jobs);
});

// 2. Add / Update Custom Job
app.post('/api/jobs', (req, res) => {
  try {
    const newJob: JobDescription = req.body;
    if (!newJob.title || !newJob.requiredSkills) {
      return res.status(400).json({ error: 'Job title and required skills are mandatory.' });
    }
    if (!newJob.id) {
      newJob.id = `custom-job-${Date.now()}`;
    }
    const jobs = loadJsonFile<JobDescription[]>(JOBS_FILE, []);
    jobs.unshift(newJob);
    fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
    res.json({ success: true, job: newJob, total: jobs.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get Skills Taxonomy & Free Courses
app.get('/api/skills', (req, res) => {
  const skills = loadJsonFile<SkillsData>(SKILLS_FILE, { categories: [] });
  res.json(skills);
});

// 4. Get Benchmarks
app.get('/api/benchmarks', (req, res) => {
  const benchmarks = loadBenchmarks();
  res.json(benchmarks);
});

// 5. Get Sample Resumes (both /api/samples and /api/sample-resumes supported)
const sendSampleResumes = (req: express.Request, res: express.Response) => {
  const samples = loadJsonFile<SampleResume[]>(SAMPLES_FILE, []);
  res.json(samples);
};
app.get('/api/samples', sendSampleResumes);
app.get('/api/sample-resumes', sendSampleResumes);

// 6. Analyze Resume Text Endpoint
app.post('/api/analyze', (req, res) => {
  try {
    const { resumeText, targetJobId, fileName } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text (at least 20 characters).' });
    }

    const jobs = loadJsonFile<JobDescription[]>(JOBS_FILE, []);
    const skills = loadJsonFile<SkillsData>(SKILLS_FILE, { categories: [] });
    const benchmarks = loadBenchmarks();

    const analysis = analyzeResumeNLP(resumeText, jobs, skills, benchmarks, targetJobId, fileName);
    res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

// 7. Upload Resume File Endpoint (PDF, DOCX, TXT)
app.post('/api/upload-resume', upload.any(), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const file = files && files.length > 0 ? files[0] : (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded. Please attach a PDF, DOCX, or TXT file.' });
    }

    const originalName = file.originalname || 'uploaded_resume';
    const ext = path.extname(originalName).toLowerCase();
    let extractedText = '';

    if (ext === '.pdf') {
      extractedText = await extractTextFromPDF(file.buffer);
    } else if (ext === '.docx' || ext === '.doc') {
      extractedText = await extractTextFromDOCX(file.buffer);
    } else if (ext === '.txt' || ext === '.json' || ext === '.md') {
      extractedText = file.buffer.toString('utf-8');
    } else {
      // Attempt generic text parsing
      extractedText = file.buffer.toString('utf-8');
    }

    // Clean text
    extractedText = extractedText.replace(/\r\n/g, '\n').trim();

    if (!extractedText || extractedText.length < 30) {
      return res.status(400).json({
        error: 'Could not extract legible text from file. Please ensure it is not an image-only scanned PDF, or paste text directly.'
      });
    }

    const targetJobId = req.body.targetJobId as string | undefined;
    const jobs = loadJsonFile<JobDescription[]>(JOBS_FILE, []);
    const skills = loadJsonFile<SkillsData>(SKILLS_FILE, { categories: [] });
    const benchmarks = loadBenchmarks();

    const analysis = analyzeResumeNLP(extractedText, jobs, skills, benchmarks, targetJobId, originalName);

    res.json({
      extractedText,
      analysis,
      fileName: originalName,
      fileSize: file.size
    });
  } catch (error: any) {
    console.error('File upload & extraction error:', error);
    res.status(500).json({ error: error.message || 'Failed to process resume file' });
  }
});

// 8. Gemini AI Deep Review (Server-Side)
app.post('/api/gemini/deep-review', async (req, res) => {
  try {
    const { resumeText, targetJob, targetJobTitle, targetJobDescription } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required for AI deep review.' });
    }

    const finalTitle = targetJobTitle || targetJob?.title;
    const finalDesc = targetJobDescription || (targetJob ? `${targetJob.description} Skills: ${targetJob.requiredSkills?.join(', ')}` : undefined);

    const review = await generateAIDeepReview(resumeText, finalTitle, finalDesc);
    if (!review) {
      return res.json({
        available: false,
        message: 'Gemini API not configured or temporary limit reached. Standard NLP analysis remains active.'
      });
    }

    res.json({ available: true, review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Gemini AI Bullet Point Rewriter (Server-Side)
app.post('/api/gemini/rewrite-bullet', async (req, res) => {
  try {
    const { bullet, targetRole } = req.body;
    if (!bullet) {
      return res.status(400).json({ error: 'Bullet point text is required.' });
    }

    const rewritten = await rewriteBulletWithGemini(bullet, targetRole);
    if (!rewritten) {
      return res.json({
        available: false,
        rewrittenBullet: `Architected ${bullet.replace(/^(worked on|helped with|helped|responsible for)\s*/i, '')}, improving performance metrics by 35% and enhancing operational throughput.`
      });
    }

    res.json({ available: true, ...rewritten });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 404 catch-all for any unhandled /api/* routes - guarantees valid JSON is returned instead of HTML
app.all('/api/*', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
});

// API Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api')) {
    console.error('API Error:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  }
  next(err);
});

// ==========================================
// VITE / SERVER INITIALIZATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Resume Analyzer Server running on port ${PORT}`);
  });
}

startServer();
