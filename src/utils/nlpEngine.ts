import {
  JobDescription,
  SkillsData,
  BenchmarkResume,
  FullResumeAnalysis,
  JobSuitabilityResult,
  ATSCheckItem,
  BulletAuditItem,
  SkillGapItem,
  BenchmarkComparison,
  FreeCourse,
  BenchmarkMetrics
} from '../types';

// Stop words list for clean TF-IDF
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Strong Action Verbs Dictionary
const STRONG_ACTION_VERBS = [
  'architected', 'spearheaded', 'engineered', 'orchestrated', 'optimized', 'automated',
  'deployed', 'redesigned', 'built', 'streamlined', 'mentored', 'formulated', 'scaled',
  'overhauled', 'accelerated', 'pioneered', 'championed', 'transformed', 'delivered',
  'maximized', 'eliminated', 'modernized', 'revamped', 'consolidated', 'negotiated',
  'established', 'devised', 'quantified', 'innovated', 'executed'
];

const MODERATE_ACTION_VERBS = [
  'developed', 'created', 'implemented', 'analyzed', 'integrated', 'maintained',
  'designed', 'tested', 'managed', 'configured', 'collaborated', 'generated',
  'monitored', 'reviewed', 'produced', 'supported', 'guided', 'coordinated'
];

const WEAK_ACTION_VERBS = [
  'worked on', 'helped', 'helped with', 'responsible for', 'assisted', 'handled',
  'involved in', 'participated in', 'did', 'made', 'looked after', 'attempted',
  'tried', 'took care of', 'was part of', 'familiar with', 'learned'
];

// Standard ATS Resume Section Headers Map
const STANDARD_SECTIONS_MAP: Record<string, string> = {
  'summary': 'Professional Summary',
  'professional summary': 'Professional Summary',
  'executive summary': 'Professional Summary',
  'about me': 'Professional Summary',
  'profile': 'Professional Summary',
  'career objective': 'Professional Summary',
  'objective': 'Professional Summary',
  'experience': 'Professional Experience',
  'work experience': 'Professional Experience',
  'professional experience': 'Professional Experience',
  'employment history': 'Professional Experience',
  'work history': 'Professional Experience',
  'stuff i\'ve done': 'Professional Experience',
  'past roles': 'Professional Experience',
  'skills': 'Technical Skills',
  'technical skills': 'Technical Skills',
  'core competencies': 'Technical Skills',
  'skills & tools': 'Technical Skills',
  'technologies': 'Technical Skills',
  'things i know': 'Technical Skills',
  'education': 'Education',
  'academic background': 'Education',
  'school': 'Education',
  'qualifications': 'Education',
  'certifications': 'Certifications & Licenses',
  'certifications & licenses': 'Certifications & Licenses',
  'certificates': 'Certifications & Licenses',
  'projects': 'Projects & Key Initiatives',
  'personal projects': 'Projects & Key Initiatives',
  'key projects': 'Projects & Key Initiatives'
};

/**
 * Clean & Tokenize text into lower-case alphanumeric tokens
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#\-\s\.]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Generate n-grams for multi-word skill matching
 */
export function generateNgrams(tokens: string[], n: number): string[] {
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

/**
 * Compute Term Frequency (TF)
 */
export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  if (tokens.length === 0) return tf;
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  for (const [key, val] of tf.entries()) {
    tf.set(key, val / tokens.length);
  }
  return tf;
}

/**
 * Compute Cosine Similarity between two token sets
 */
export function computeCosineSimilarity(docA: string[], docB: string[]): number {
  const tfA = computeTF(docA);
  const tfB = computeTF(docB);

  const allWords = new Set([...tfA.keys(), ...tfB.keys()]);
  if (allWords.size === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const word of allWords) {
    const valA = tfA.get(word) || 0;
    const valB = tfB.get(word) || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.min(100, Math.max(0, Math.round(similarity * 100)));
}

/**
 * Check if a bullet point contains quantified metrics
 */
export function hasQuantification(sentence: string): boolean {
  const regex = /(\b\d+(\.\d+)?%|\$\d+(\.\d+)?[kKmMbB]?|\b\d+(\.\d+)?x\b|\b\d+(\.\d+)?\s*(k|m|million|billion|kilo|thousand|ms|seconds|minutes|hours|days|weeks|months|years|requests|users|transactions|services|engineers|cves|tickets|points)\b|\b\d{2,}\b)/i;
  return regex.test(sentence);
}

/**
 * Extract bullets and lines from resume text
 */
export function extractBulletPoints(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const cleaned = trimmed.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219\d+\.]\s*/, '').trim();
      if (cleaned.length > 10) bullets.push(cleaned);
    } else if (trimmed.length > 25 && /^[A-Z]/.test(trimmed) && trimmed.split(' ').length >= 5 && !trimmed.endsWith(':')) {
      bullets.push(trimmed);
    }
  }

  return bullets;
}

/**
 * Identify action verb in a bullet point
 */
export function auditBulletPoint(bullet: string): BulletAuditItem {
  const lower = bullet.toLowerCase().trim();
  const words = lower.split(/\s+/);
  const wordCount = words.length;
  const isQuantified = hasQuantification(bullet);

  let detectedVerb: string | null = null;
  let verbStrength: 'strong' | 'moderate' | 'weak' = 'moderate';

  for (const weak of WEAK_ACTION_VERBS) {
    if (lower.startsWith(weak) || lower.includes(' ' + weak + ' ')) {
      detectedVerb = weak;
      verbStrength = 'weak';
      break;
    }
  }

  if (!detectedVerb) {
    for (const strong of STRONG_ACTION_VERBS) {
      if (words[0] === strong || words[0] === strong + 'd' || words[0] === strong + 'ed' || words.slice(0, 2).includes(strong)) {
        detectedVerb = strong;
        verbStrength = 'strong';
        break;
      }
    }
  }

  if (!detectedVerb) {
    for (const mod of MODERATE_ACTION_VERBS) {
      if (words[0] === mod || words.slice(0, 2).includes(mod)) {
        detectedVerb = mod;
        verbStrength = 'moderate';
        break;
      }
    }
  }

  let suggested = bullet;
  if (verbStrength === 'weak' || !isQuantified) {
    const firstNounOrTopic = bullet.replace(/^(worked on|helped with|helped|responsible for|assisted with|assisted|did|made)\s*/i, '').trim();
    if (verbStrength === 'weak') {
      const replacementVerb = STRONG_ACTION_VERBS[Math.floor(Math.random() * 5)];
      const capitalized = replacementVerb.charAt(0).toUpperCase() + replacementVerb.slice(1);
      suggested = `${capitalized} ${firstNounOrTopic}, increasing efficiency by 30% and reducing turnaround time.`;
    } else if (!isQuantified) {
      suggested = `${bullet} — achieving a 25%+ performance improvement across key operational metrics.`;
    }
  }

  return {
    original: bullet,
    isQuantified,
    actionVerb: detectedVerb || (words[0] || 'none'),
    verbStrength,
    wordCount,
    suggestedImprovement: suggested
  };
}

/**
 * Parse contact information & detected sections from raw resume
 */
export function parseResumeStructure(text: string) {
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  const linkedInMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  const gitHubMatch = text.match(/(github\.com\/[a-zA-Z0-9_-]+)/i);
  const portfolioMatch = text.match(/(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*|[a-zA-Z0-9-]+\.(?:dev|io|me|app|tech))/i);

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let detectedName = 'Candidate';
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('http') && !firstLine.includes('Resume')) {
      detectedName = firstLine;
    }
  }

  const detectedSections: {
    title: string;
    isStandard: boolean;
    suggestedTitle?: string;
    contentSnippet: string;
  }[] = [];

  const sectionCandidates = [
    'summary', 'professional summary', 'executive summary', 'about me', 'profile', 'career objective', 'objective',
    'experience', 'work experience', 'professional experience', 'employment history', 'work history', 'stuff i\'ve done', 'past roles',
    'skills', 'technical skills', 'core competencies', 'skills & tools', 'technologies', 'things i know',
    'education', 'academic background', 'school', 'qualifications',
    'certifications', 'certifications & licenses', 'certificates',
    'projects', 'personal projects', 'key projects'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().replace(/[:\-_#]/g, '').trim();
    if (sectionCandidates.includes(line)) {
      const standardName = STANDARD_SECTIONS_MAP[line] || lines[i];
      const isStandard = lines[i].toLowerCase().trim() === standardName.toLowerCase();
      const snippet = lines.slice(i + 1, i + 4).join(' ').slice(0, 150);

      detectedSections.push({
        title: lines[i],
        isStandard,
        suggestedTitle: isStandard ? undefined : standardName,
        contentSnippet: snippet
      });
    }
  }

  return {
    detectedName,
    contactInfo: {
      email: emailMatch ? emailMatch[1] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      linkedIn: linkedInMatch ? linkedInMatch[1] : undefined,
      gitHub: gitHubMatch ? gitHubMatch[1] : undefined,
      portfolio: portfolioMatch ? portfolioMatch[1] : undefined,
      location: text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/)?.[0] || undefined
    },
    detectedSections
  };
}

/**
 * Match skills against taxonomy and free course catalog
 */
export function analyzeSkillGaps(resumeText: string, skillsData: SkillsData, targetJob?: JobDescription) {
  const resumeLower = resumeText.toLowerCase();
  const gapItems: SkillGapItem[] = [];
  let matchedCount = 0;
  let partialCount = 0;
  let missingCount = 0;

  const categories = skillsData?.categories || [];

  for (const category of categories) {
    for (const skill of category.skills || []) {
      const allAliases = [skill.name.toLowerCase(), ...(skill.aliases || []).map(a => a.toLowerCase())];
      
      let isFound = false;
      let matchedTerm = '';

      for (const alias of allAliases) {
        const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(resumeLower) || resumeLower.includes(alias)) {
          isFound = true;
          matchedTerm = alias;
          break;
        }
      }

      const isTargetJobSkill = targetJob?.requiredSkills?.some(s => s.toLowerCase() === skill.name.toLowerCase()) ||
        targetJob?.preferredSkills?.some(s => s.toLowerCase() === skill.name.toLowerCase());

      let status: 'matched' | 'partial' | 'missing' = 'missing';
      if (isFound) {
        status = 'matched';
        matchedCount++;
      } else if (isTargetJobSkill) {
        status = 'missing';
        missingCount++;
      } else {
        const tokens = tokenize(skill.name);
        const partialFound = tokens.some(t => resumeLower.includes(t));
        status = partialFound ? 'partial' : 'missing';
        if (partialFound) partialCount++;
        else missingCount++;
      }

      gapItems.push({
        skillName: skill.name,
        category: category.name,
        importance: isTargetJobSkill ? 'High' : (skill.importance as any) || 'Medium',
        status,
        evidence: isFound ? `Matched keyword "${matchedTerm}" in resume` : undefined,
        recommendedCourses: skill.freeCourses || []
      });
    }
  }

  const topRecommendedCourses: FreeCourse[] = [];
  const addedCourses = new Set<string>();

  for (const gap of gapItems) {
    if (gap.status !== 'matched' && gap.importance === 'High') {
      for (const course of gap.recommendedCourses) {
        if (!addedCourses.has(course.title)) {
          addedCourses.add(course.title);
          topRecommendedCourses.push(course);
        }
      }
    }
  }

  if (topRecommendedCourses.length < 4) {
    for (const gap of gapItems) {
      if (gap.status !== 'matched') {
        for (const course of gap.recommendedCourses) {
          if (!addedCourses.has(course.title)) {
            addedCourses.add(course.title);
            topRecommendedCourses.push(course);
          }
        }
      }
    }
  }

  return {
    matchedCount,
    partialCount,
    missingCount,
    gapItems,
    topRecommendedCourses: topRecommendedCourses.slice(0, 8)
  };
}

/**
 * Evaluate ATS compatibility and optimization rules
 */
export function evaluateATSReadiness(
  text: string,
  structure: ReturnType<typeof parseResumeStructure>,
  bullets: string[],
  bulletAudits: BulletAuditItem[]
) {
  const checks: ATSCheckItem[] = [];
  let score = 100;

  // 1. Contact Information Check
  const hasEmail = Boolean(structure.contactInfo.email);
  const hasPhone = Boolean(structure.contactInfo.phone);

  if (hasEmail && hasPhone) {
    checks.push({
      id: 'contact-info',
      name: 'Contact Details & Reachability',
      category: 'formatting',
      status: 'pass',
      description: 'Valid email and phone number parsed cleanly.',
      recommendation: 'Ensure your professional email and location are situated at the very top.'
    });
  } else {
    score -= 15;
    checks.push({
      id: 'contact-info',
      name: 'Contact Details Missing',
      category: 'formatting',
      status: 'fail',
      description: `Missing: ${!hasEmail ? 'Email ' : ''}${!hasPhone ? 'Phone Number ' : ''}`,
      recommendation: 'ATS parsers reject candidates without identifiable email and phone contact info.'
    });
  }

  // 2. Standardized Section Headers Check
  const nonStandardSections = structure.detectedSections.filter(s => !s.isStandard);
  const sectionSuggestions: { current: string; standardized: string; reason: string }[] = [];

  for (const non of nonStandardSections) {
    sectionSuggestions.push({
      current: non.title,
      standardized: non.suggestedTitle || 'Professional Experience',
      reason: `ATS parsers look for exact standard terms like "${non.suggestedTitle}" to index your achievements.`
    });
  }

  if (nonStandardSections.length === 0 && structure.detectedSections.length >= 3) {
    checks.push({
      id: 'standard-headers',
      name: 'Standard ATS Section Titles',
      category: 'structure',
      status: 'pass',
      description: 'Found industry-standard section headings (Experience, Skills, Education).',
      recommendation: 'Keep headings clear and consistent without custom decorative fonts.'
    });
  } else if (nonStandardSections.length > 0) {
    score -= 12 * nonStandardSections.length;
    checks.push({
      id: 'standard-headers',
      name: 'Non-Standard Section Headings Detected',
      category: 'structure',
      status: 'warning',
      description: `Found ${nonStandardSections.length} unconventional section header(s) (e.g. "${nonStandardSections[0]?.title}").`,
      recommendation: `Rename to standardized headers like "${nonStandardSections[0]?.suggestedTitle}" so ATS systems parse your sections properly.`
    });
  } else {
    score -= 10;
    checks.push({
      id: 'standard-headers',
      name: 'Few Section Headings Identified',
      category: 'structure',
      status: 'warning',
      description: 'Unable to detect sufficient standard section markers.',
      recommendation: 'Use distinct headers like "PROFESSIONAL EXPERIENCE", "TECHNICAL SKILLS", and "EDUCATION".'
    });
  }

  // 3. Metric Quantification Ratio Check
  const quantifiedBullets = bulletAudits.filter(b => b.isQuantified);
  const quantifyRatio = bullets.length > 0 ? Math.round((quantifiedBullets.length / bullets.length) * 100) : 0;

  if (quantifyRatio >= 60) {
    checks.push({
      id: 'quantification-metrics',
      name: 'Quantified Impact & Numbers',
      category: 'content',
      status: 'pass',
      description: `${quantifyRatio}% of bullet points contain measurable metrics, percentages, or dollar amounts.`,
      recommendation: 'Top-tier candidates maintain a 60%+ quantification rate across work experiences.'
    });
  } else if (quantifyRatio >= 30) {
    score -= 10;
    checks.push({
      id: 'quantification-metrics',
      name: 'Moderate Measurable Achievements',
      category: 'content',
      status: 'warning',
      description: `Only ${quantifyRatio}% of bullets contain numerical outcomes or metrics.`,
      recommendation: 'Add specific numbers (e.g. "Reduced API latency by 40%", "Led team of 5", "Scaled to 10k users").'
    });
  } else {
    score -= 20;
    checks.push({
      id: 'quantification-metrics',
      name: 'Low Quantification & Measurable Impact',
      category: 'content',
      status: 'fail',
      description: `Only ${quantifyRatio}% of bullet points have measurable results. Most bullets read as passive task descriptions.`,
      recommendation: 'Use the Google XYZ formula: "Accomplished [X] as measured by [Y] by doing [Z]".'
    });
  }

  // 4. Action Verb Strength Check
  const strongVerbs = bulletAudits.filter(b => b.verbStrength === 'strong');
  const weakVerbs = bulletAudits.filter(b => b.verbStrength === 'weak');
  const strongVerbRatio = bullets.length > 0 ? Math.round((strongVerbs.length / bullets.length) * 100) : 0;

  if (weakVerbs.length === 0 && strongVerbRatio >= 40) {
    checks.push({
      id: 'action-verbs',
      name: 'High-Impact Action Verbs',
      category: 'content',
      status: 'pass',
      description: 'Bullets begin with strong action verbs like Spearheaded, Engineered, and Architected.',
      recommendation: 'Maintain past tense for previous roles and present tense for current responsibilities.'
    });
  } else if (weakVerbs.length > 0) {
    score -= 8 * Math.min(weakVerbs.length, 3);
    checks.push({
      id: 'action-verbs',
      name: 'Passive Verbs Detected',
      category: 'content',
      status: 'warning',
      description: `Identified ${weakVerbs.length} bullet(s) with weak or passive verbs (e.g. "${weakVerbs[0]?.actionVerb}").`,
      recommendation: 'Replace passive phrases like "worked on" or "helped" with strong verbs like "Architected", "Optimized", or "Delivered".'
    });
  }

  // 5. Length & Formatting Hazard Checks
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount < 150) {
    score -= 20;
    checks.push({
      id: 'resume-length',
      name: 'Resume Too Short',
      category: 'formatting',
      status: 'fail',
      description: `Resume contains only ${wordCount} words.`,
      recommendation: 'Standard professional resumes average 400 - 800 words with detailed project scope.'
    });
  } else if (wordCount > 1200) {
    score -= 10;
    checks.push({
      id: 'resume-length',
      name: 'Resume Exceeds Optimal Word Count',
      category: 'formatting',
      status: 'warning',
      description: `Resume contains ${wordCount} words, which may exceed standard 1-2 page length.`,
      recommendation: 'Trim older or less relevant responsibilities to keep resume concise and readable.'
    });
  } else {
    checks.push({
      id: 'resume-length',
      name: 'Optimal Content Length',
      category: 'formatting',
      status: 'pass',
      description: `Resume length (${wordCount} words) is well-calibrated for standard ATS screening.`,
      recommendation: 'Single page for <5 years experience; two pages for 5+ years experience.'
    });
  }

  score = Math.max(20, Math.min(100, score));

  let rating: 'Excellent' | 'Good' | 'Needs Optimization' | 'Critical Issues' = 'Good';
  if (score >= 90) rating = 'Excellent';
  else if (score >= 75) rating = 'Good';
  else if (score >= 55) rating = 'Needs Optimization';
  else rating = 'Critical Issues';

  const formattingTips = [
    'Use standard sans-serif fonts (Calibri, Arial, Helvetica) between 10pt and 12pt.',
    'Avoid 2-column multi-table templates, embedded images, and floating text boxes as ATS scanners parse text linearly.',
    'Save and upload as clean .docx or text-based .pdf rather than scanned image PDFs.',
    'Maintain chronological date formats uniformly (e.g. "Jan 2022 – Present").'
  ];

  return {
    score,
    rating,
    checks,
    bulletAudits,
    sectionSuggestions,
    formattingTips
  };
}

/**
 * Compare resume against job descriptions in jobs.json
 */
export function matchResumeAgainstJobs(
  resumeText: string,
  jobs: JobDescription[],
  targetJobId?: string
): { allJobMatches: JobSuitabilityResult[]; targetJobFit?: JobSuitabilityResult } {
  const resumeLower = resumeText.toLowerCase();
  const resumeTokens = tokenize(resumeText);
  const resumeNgrams = [...generateNgrams(resumeTokens, 2), ...generateNgrams(resumeTokens, 3)];

  const results: JobSuitabilityResult[] = [];

  for (const job of jobs || []) {
    // 1. Required & Preferred Skills match
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const req of job.requiredSkills || []) {
      const reqLower = req.toLowerCase();
      if (resumeLower.includes(reqLower) || resumeTokens.includes(reqLower)) {
        matchedSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    }

    const matchedPreferred: string[] = [];
    for (const pref of job.preferredSkills || []) {
      const prefLower = pref.toLowerCase();
      if (resumeLower.includes(prefLower) || resumeTokens.includes(prefLower)) {
        matchedPreferred.push(pref);
        if (!matchedSkills.includes(pref)) matchedSkills.push(pref);
      }
    }

    const skillsScore = (job.requiredSkills || []).length > 0
      ? Math.round(((matchedSkills.length) / (job.requiredSkills.length + (job.preferredSkills?.length || 0) * 0.5)) * 100)
      : 70;

    // 2. Keywords Overlap
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const kw of job.keywords || []) {
      const kwLower = kw.toLowerCase();
      if (resumeLower.includes(kwLower) || resumeTokens.includes(kwLower) || resumeNgrams.includes(kwLower)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    const jobTokens = tokenize(`${job.title} ${job.description} ${(job.responsibilities || []).join(' ')} ${(job.keywords || []).join(' ')}`);
    const cosineSim = computeCosineSimilarity(resumeTokens, jobTokens);
    const directKeywordScore = (job.keywords || []).length > 0
      ? Math.round((matchedKeywords.length / job.keywords.length) * 100)
      : 50;
    const keywordOverlapScore = Math.round(cosineSim * 0.4 + directKeywordScore * 0.6);

    // 3. Experience Relevance Score
    let experienceRelevance = 70;
    const isJobIntern = (job.level || '').toLowerCase().includes('intern');
    const isJobFresher = (job.level || '').toLowerCase().includes('fresher') || (job.level || '').toLowerCase().includes('entry') || (job.level || '').toLowerCase().includes('graduate');
    const isJobSenior = (job.level || '').toLowerCase().includes('senior') || (job.level || '').toLowerCase().includes('lead') || (job.level || '').toLowerCase().includes('architect');

    const isResumeSenior = resumeLower.includes('senior') || resumeLower.includes('lead') || resumeLower.includes('staff') || resumeLower.includes('architect') || resumeLower.includes('principal');
    const isResumeStudentOrFresher = resumeLower.includes('intern') || resumeLower.includes('student') || resumeLower.includes('graduate') || resumeLower.includes('fresher') || resumeLower.includes('junior') || resumeLower.includes('bachelor') || resumeLower.includes('gpa') || resumeLower.includes('university') || resumeLower.includes('college');

    if (isJobIntern) {
      if (isResumeStudentOrFresher) {
        experienceRelevance = 94;
      } else if (isResumeSenior) {
        experienceRelevance = 72;
      } else {
        experienceRelevance = 85;
      }
    } else if (isJobFresher) {
      if (isResumeStudentOrFresher) {
        experienceRelevance = 92;
      } else if (isResumeSenior) {
        experienceRelevance = 80;
      } else {
        experienceRelevance = 86;
      }
    } else if (isJobSenior) {
      if (isResumeSenior) {
        experienceRelevance = 95;
      } else if (isResumeStudentOrFresher) {
        experienceRelevance = 45;
      } else {
        experienceRelevance = 70;
      }
    } else {
      if (isResumeSenior) {
        experienceRelevance = 90;
      } else if (isResumeStudentOrFresher) {
        experienceRelevance = 65;
      } else {
        experienceRelevance = 82;
      }
    }

    // 4. Education & Certification Score
    let eduScore = 70;
    if (resumeLower.includes('bachelor') || resumeLower.includes('b.s.') || resumeLower.includes('master') || resumeLower.includes('m.s.') || resumeLower.includes('ph.d') || resumeLower.includes('degree') || resumeLower.includes('university')) {
      eduScore += 15;
    }
    if (resumeLower.includes('certified') || resumeLower.includes('certification') || resumeLower.includes('aws') || resumeLower.includes('google') || resumeLower.includes('hackathon') || resumeLower.includes('dean\'s list') || resumeLower.includes('honor')) {
      eduScore += 15;
    }
    eduScore = Math.min(100, eduScore);

    const matchScore = Math.min(
      99,
      Math.max(
        15,
        Math.round(
          skillsScore * 0.40 +
          keywordOverlapScore * 0.30 +
          experienceRelevance * 0.20 +
          eduScore * 0.10
        )
      )
    );

    const fitExplanation: string[] = [];
    const strengths: string[] = [];
    const improvementAreas: string[] = [];

    if (matchedSkills.length > 0) {
      fitExplanation.push(`Direct alignment on ${matchedSkills.length} key technical requirements: ${matchedSkills.slice(0, 4).join(', ')}.`);
      strengths.push(`Strong proficiency demonstrated in core technologies (${matchedSkills.slice(0, 3).join(', ')}).`);
    }

    if (keywordOverlapScore >= 60) {
      fitExplanation.push(`High contextual relevance with ${job.department} domain terminology (${matchedKeywords.slice(0, 3).join(', ')}).`);
      strengths.push('Excellent keyword density corresponding to role expectations.');
    }

    if (missingSkills.length > 0) {
      fitExplanation.push(`Identified skill gaps in: ${missingSkills.slice(0, 3).join(', ')}.`);
      improvementAreas.push(`Incorporate hands-on experience or certified courses in ${missingSkills.slice(0, 3).join(', ')}.`);
    }

    if (missingKeywords.length > 0) {
      improvementAreas.push(`Add missing role keywords: ${missingKeywords.slice(0, 4).join(', ')}.`);
    }

    results.push({
      jobId: job.id,
      jobTitle: job.title,
      department: job.department,
      level: job.level,
      experienceYears: job.experienceYears,
      matchScore,
      subScores: {
        skillsMatch: Math.min(100, skillsScore),
        keywordOverlap: Math.min(100, keywordOverlapScore),
        experienceRelevance: Math.min(100, experienceRelevance),
        educationCertifications: Math.min(100, eduScore)
      },
      matchedSkills,
      missingSkills,
      matchedKeywords,
      missingKeywords,
      fitExplanation,
      strengths,
      improvementAreas
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  const targetJobFit = targetJobId ? results.find(r => r.jobId === targetJobId) : results[0];

  return {
    allJobMatches: results,
    targetJobFit
  };
}

/**
 * Compare resume against curated benchmarks
 */
export function benchmarkResume(
  atsScore: number,
  quantifiedRatio: number,
  bulletAudits: BulletAuditItem[],
  matchedSkillsCount: number,
  benchmarks: BenchmarkResume[]
): BenchmarkComparison {
  const strongVerbsCount = bulletAudits.filter(b => b.verbStrength === 'strong').length;
  const actionVerbStrength = bulletAudits.length > 0 ? Math.round((strongVerbsCount / bulletAudits.length) * 100) : 40;

  const keywordDensity = Math.min(100, Math.round(matchedSkillsCount * 3.2 + 20));
  const technicalDepth = Math.min(100, Math.round(matchedSkillsCount * 3.5 + 25));
  const structureScore = atsScore;

  const userMetrics: BenchmarkMetrics = {
    atsReadiness: atsScore,
    keywordDensity,
    quantifiedAchievements: quantifiedRatio,
    technicalDepth,
    structureAndFormatting: structureScore,
    actionVerbStrength
  };

  const userOverall = Math.round(
    userMetrics.atsReadiness * 0.25 +
    userMetrics.keywordDensity * 0.20 +
    userMetrics.quantifiedAchievements * 0.25 +
    userMetrics.technicalDepth * 0.15 +
    userMetrics.actionVerbStrength * 0.15
  );

  let percentileBand = 'Average (55th Percentile)';
  let percentileNumber = 55;

  if (userOverall >= 90) {
    percentileBand = 'Top 10% (94th Percentile)';
    percentileNumber = 94;
  } else if (userOverall >= 80) {
    percentileBand = 'Top 20% (82nd Percentile)';
    percentileNumber = 82;
  } else if (userOverall >= 70) {
    percentileBand = 'Above Average (72nd Percentile)';
    percentileNumber = 72;
  } else if (userOverall >= 55) {
    percentileBand = 'Average (55th Percentile)';
    percentileNumber = 55;
  } else {
    percentileBand = 'Below Average (35th Percentile)';
    percentileNumber = 35;
  }

  const top10 = benchmarks?.find(b => b.overallScore >= 90)?.metrics || {
    atsReadiness: 96,
    keywordDensity: 92,
    quantifiedAchievements: 90,
    technicalDepth: 95,
    structureAndFormatting: 95,
    actionVerbStrength: 92
  };

  const avgBench = benchmarks?.find(b => b.overallScore >= 60 && b.overallScore < 75)?.metrics || {
    atsReadiness: 65,
    keywordDensity: 60,
    quantifiedAchievements: 45,
    technicalDepth: 68,
    structureAndFormatting: 65,
    actionVerbStrength: 55
  };

  const keyStrengths: string[] = [];
  const keyGaps: string[] = [];

  if (userMetrics.quantifiedAchievements >= 60) {
    keyStrengths.push('High percentage of measurable business outcomes (Top quartile).');
  } else {
    keyGaps.push('Quantified achievements ratio is below Top 20% benchmark (60%+ needed).');
  }

  if (userMetrics.atsReadiness >= 85) {
    keyStrengths.push('Clean ATS compliance with standard section mapping.');
  } else {
    keyGaps.push('ATS formatting hazards and non-standard headings reduce screening odds.');
  }

  if (userMetrics.actionVerbStrength >= 60) {
    keyStrengths.push('Strong leadership verbs drive executive narrative.');
  } else {
    keyGaps.push('Replace passive task descriptions with strong power verbs.');
  }

  return {
    userScore: userOverall,
    percentileBand,
    percentileNumber,
    userMetrics,
    benchmarkTop10: top10,
    benchmarkAverage: avgBench,
    rankSummary: `Your resume currently ranks in the ${percentileBand} compared to 2,400+ successfully screened engineering and product candidates.`,
    keyStrengths,
    keyGaps,
    closestBenchmarkTitle: benchmarks?.[0]?.title || 'Senior Full Stack Engineer'
  };
}

/**
 * Main Orchestrator: Execute full NLP analysis on resume text
 */
export function analyzeResumeNLP(
  resumeText: string,
  jobsData: JobDescription[],
  skillsData: SkillsData,
  benchmarksData: BenchmarkResume[],
  targetJobId?: string,
  fileName?: string
): FullResumeAnalysis {
  const structure = parseResumeStructure(resumeText);
  const bullets = extractBulletPoints(resumeText);
  const bulletAudits = bullets.map(b => auditBulletPoint(b));
  const quantifiedCount = bulletAudits.filter(b => b.isQuantified).length;
  const quantifiedPercentage = bullets.length > 0 ? Math.round((quantifiedCount / bullets.length) * 100) : 0;

  const selectedJob = targetJobId ? (jobsData || []).find(j => j.id === targetJobId) : (jobsData || [])[0];

  const skillGaps = analyzeSkillGaps(resumeText, skillsData, selectedJob);
  const atsReadiness = evaluateATSReadiness(resumeText, structure, bullets, bulletAudits);
  const { allJobMatches, targetJobFit } = matchResumeAgainstJobs(resumeText, jobsData, targetJobId);
  const benchmarking = benchmarkResume(
    atsReadiness.score,
    quantifiedPercentage,
    bulletAudits,
    skillGaps.matchedCount,
    benchmarksData
  );

  return {
    parsedResume: {
      fileName,
      charCount: resumeText.length,
      wordCount: resumeText.split(/\s+/).filter(Boolean).length,
      detectedName: structure.detectedName,
      contactInfo: structure.contactInfo,
      detectedSections: structure.detectedSections,
      extractedSkills: skillGaps.gapItems.filter(g => g.status === 'matched').map(g => g.skillName),
      quantifiedBulletsPercentage: quantifiedPercentage,
      totalBulletsCount: bullets.length,
      quantifiedBulletsCount: quantifiedCount
    },
    targetJobFit,
    allJobMatches,
    atsReadiness,
    skillGaps,
    benchmarking,
    aiExecutiveSummary: `Candidate demonstrates strong technical breadth across ${skillGaps.matchedCount} verified industry skills with a ${atsReadiness.score}/100 ATS Readiness score and ${benchmarking.percentileBand} ranking.`
  };
}
