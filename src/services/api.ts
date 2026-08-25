import { 
  JobDescription, 
  SkillsData, 
  BenchmarkResume, 
  SampleResume, 
  FullResumeAnalysis 
} from '../types';
import { analyzeResumeNLP } from '../utils/nlpEngine';

// Direct JSON imports via Vite
import rawJobs from '../../data/jobs.json';
import rawSkills from '../../data/skills.json';
import rawSamples from '../../data/sample_resumes.json';

import topFullstack from '../../data/benchmarks/top_fullstack_lead.json';
import seniorML from '../../data/benchmarks/senior_ml_engineer.json';
import cloudDevops from '../../data/benchmarks/cloud_devops_architect.json';
import avgSWE from '../../data/benchmarks/average_software_engineer.json';
import entryDev from '../../data/benchmarks/entry_level_developer.json';

export const fallbackJobs: JobDescription[] = rawJobs as unknown as JobDescription[];
export const fallbackSkills: SkillsData = rawSkills as unknown as SkillsData;
export const fallbackSamples: SampleResume[] = rawSamples as unknown as SampleResume[];
export const fallbackBenchmarks: BenchmarkResume[] = [
  topFullstack,
  seniorML,
  cloudDevops,
  avgSWE,
  entryDev
] as unknown as BenchmarkResume[];

/**
 * Safe JSON fetch helper that strictly guards against HTML responses (e.g. Vite SPA <!doctype html> fallbacks)
 * and network errors, returning fallback data instead of throwing JSON syntax errors.
 */
export async function safeFetchJson<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn(`[API] ${url} returned status ${res.status}`);
      return fallback as T;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Returned HTML or plain text (e.g. <!doctype html> from SPA fallback)
      console.warn(`[API] ${url} returned non-JSON content-type: "${contentType}"`);
      return fallback as T;
    }
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      console.warn(`[API] ${url} returned HTML body starting with "<"`);
      return fallback as T;
    }
    return JSON.parse(text) as T;
  } catch (err) {
    console.warn(`[API] Safe fetch failed for ${url}:`, err);
    return fallback as T;
  }
}

/**
 * Fetch Jobs with instant fallback
 */
export async function fetchJobs(): Promise<JobDescription[]> {
  const jobs = await safeFetchJson<JobDescription[]>('/api/jobs', undefined, fallbackJobs);
  return Array.isArray(jobs) && jobs.length > 0 ? jobs : fallbackJobs;
}

/**
 * Fetch Skills Taxonomy with instant fallback
 */
export async function fetchSkills(): Promise<SkillsData> {
  const skills = await safeFetchJson<SkillsData>('/api/skills', undefined, fallbackSkills);
  return skills?.categories ? skills : fallbackSkills;
}

/**
 * Fetch Sample Resumes with instant fallback
 */
export async function fetchSampleResumes(): Promise<SampleResume[]> {
  const samples = await safeFetchJson<SampleResume[]>('/api/samples', undefined, fallbackSamples);
  return Array.isArray(samples) && samples.length > 0 ? samples : fallbackSamples;
}

/**
 * Fetch Benchmark Resumes with instant fallback
 */
export async function fetchBenchmarks(): Promise<BenchmarkResume[]> {
  const benches = await safeFetchJson<BenchmarkResume[]>('/api/benchmarks', undefined, fallbackBenchmarks);
  return Array.isArray(benches) && benches.length > 0 ? benches : fallbackBenchmarks;
}

/**
 * Analyze Resume: tries /api/analyze, if not available or returning HTML/error, runs high-precision local NLP engine
 */
export async function analyzeResume(
  resumeText: string,
  targetJobId: string,
  allJobs: JobDescription[],
  skillsData: SkillsData,
  benchmarksData: BenchmarkResume[],
  fileName?: string
): Promise<FullResumeAnalysis> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, targetJobId, fileName })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const text = await res.text();
      if (text && !text.trim().startsWith('<')) {
        const data = JSON.parse(text) as FullResumeAnalysis;
        if (data && data.atsReadiness && data.allJobMatches) {
          return data;
        }
      }
    }
  } catch (e) {
    console.warn('[API] Server NLP analyze route unavailable, falling back to instant client NLP engine:', e);
  }

  // Seamless client-side NLP analysis execution
  return analyzeResumeNLP(
    resumeText,
    allJobs && allJobs.length > 0 ? allJobs : fallbackJobs,
    skillsData?.categories ? skillsData : fallbackSkills,
    benchmarksData && benchmarksData.length > 0 ? benchmarksData : fallbackBenchmarks,
    targetJobId,
    fileName
  );
}

/**
 * Add / Update Custom Job
 */
export async function addCustomJob(job: JobDescription): Promise<boolean> {
  try {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    return res.ok;
  } catch (e) {
    console.warn('[API] Save job to backend failed:', e);
    return false;
  }
}

/**
 * Trigger Gemini AI Deep Review with safe error fallback
 */
export async function triggerGeminiDeepReview(
  resumeText: string,
  targetJob: JobDescription
): Promise<any | null> {
  try {
    const res = await fetch('/api/gemini/deep-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, targetJob })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const text = await res.text();
      if (text && !text.trim().startsWith('<')) {
        return JSON.parse(text);
      }
    }
  } catch (e) {
    console.warn('[API] Gemini Deep Review call failed:', e);
  }
  return null;
}

/**
 * Trigger Gemini Bullet Rewriter with safe error fallback
 */
export async function triggerGeminiBulletRewrite(
  bullet: string,
  targetRole?: string
): Promise<string | null> {
  try {
    const res = await fetch('/api/gemini/rewrite-bullet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet, targetRole })
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const text = await res.text();
      if (text && !text.trim().startsWith('<')) {
        const data = JSON.parse(text);
        return data?.rewrittenBullet || null;
      }
    }
  } catch (e) {
    console.warn('[API] Gemini bullet rewrite call failed:', e);
  }
  return null;
}

/**
 * Upload Resume File with server-side text extraction or client-side fallback
 */
export async function uploadResumeFile(
  file: File,
  targetJobId: string,
  allJobs: JobDescription[],
  skillsData: SkillsData,
  benchmarksData: BenchmarkResume[]
): Promise<{ extractedText: string; analysis: FullResumeAnalysis; fileName: string }> {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetJobId', targetJobId);

    const res = await fetch('/api/upload-resume', {
      method: 'POST',
      body: formData
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const text = await res.text();
      if (text && !text.trim().startsWith('<')) {
        const result = JSON.parse(text);
        if (result.extractedText && result.analysis) {
          return {
            extractedText: result.extractedText,
            analysis: result.analysis,
            fileName: result.fileName || file.name
          };
        }
      }
    }
  } catch (e) {
    console.warn('[API] Server file extraction unavailable, attempting client file read:', e);
  }

  // Client-side text read fallback
  const clientText = await readTextFromFile(file);
  const localAnalysis = analyzeResumeNLP(
    clientText,
    allJobs && allJobs.length > 0 ? allJobs : fallbackJobs,
    skillsData?.categories ? skillsData : fallbackSkills,
    benchmarksData && benchmarksData.length > 0 ? benchmarksData : fallbackBenchmarks,
    targetJobId,
    file.name
  );

  return {
    extractedText: clientText,
    analysis: localAnalysis,
    fileName: file.name
  };
}

/**
 * Helper to read plain text, JSON, or markdown from File in browser
 */
export function readTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      // Clean non-printable characters
      const cleaned = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').trim();
      resolve(cleaned || 'Uploaded resume content.');
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
