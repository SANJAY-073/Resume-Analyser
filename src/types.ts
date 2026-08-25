export interface JobDescription {
  id: string;
  title: string;
  department: string;
  level: string;
  experienceYears: number;
  location: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  keywords: string[];
}

export interface FreeCourse {
  title: string;
  provider: string;
  url: string;
  duration: string;
  level: string;
  badge: string;
}

export interface SkillItem {
  name: string;
  aliases: string[];
  importance: string;
  description: string;
  freeCourses: FreeCourse[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: SkillItem[];
}

export interface SkillsData {
  categories: SkillCategory[];
}

export interface BenchmarkMetrics {
  atsReadiness: number;
  keywordDensity: number;
  quantifiedAchievements: number;
  technicalDepth: number;
  structureAndFormatting: number;
  actionVerbStrength: number;
}

export interface BenchmarkResume {
  id: string;
  title: string;
  percentileBand: string;
  overallScore: number;
  metrics: BenchmarkMetrics;
  candidateProfile: {
    yearsExperience: number;
    education: string;
    keyAchievementsCount: number;
    quantifiedBulletsPercentage: number;
  };
  summary: string;
  sampleStrongBullets: string[];
  matchedKeywordsCount: number;
  atsChecklistPassed: string[];
}

export interface JobSuitabilityResult {
  jobId: string;
  jobTitle: string;
  department: string;
  level?: string;
  experienceYears?: number;
  matchScore: number;
  subScores: {
    skillsMatch: number;
    keywordOverlap: number;
    experienceRelevance: number;
    educationCertifications: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  fitExplanation: string[];
  strengths: string[];
  improvementAreas: string[];
}

export interface ATSCheckItem {
  id: string;
  name: string;
  category: 'formatting' | 'content' | 'keywords' | 'structure';
  status: 'pass' | 'warning' | 'fail';
  description: string;
  recommendation: string;
}

export interface BulletAuditItem {
  original: string;
  isQuantified: boolean;
  actionVerb: string | null;
  verbStrength: 'strong' | 'moderate' | 'weak';
  wordCount: number;
  suggestedImprovement: string;
}

export interface SkillGapItem {
  skillName: string;
  category: string;
  importance: 'High' | 'Medium' | 'Low';
  status: 'matched' | 'partial' | 'missing';
  evidence?: string;
  recommendedCourses: FreeCourse[];
}

export interface BenchmarkComparison {
  userScore: number;
  percentileBand: string;
  percentileNumber: number;
  userMetrics: BenchmarkMetrics;
  benchmarkTop10: BenchmarkMetrics;
  benchmarkAverage: BenchmarkMetrics;
  rankSummary: string;
  keyStrengths: string[];
  keyGaps: string[];
  closestBenchmarkTitle: string;
}

export interface FullResumeAnalysis {
  parsedResume: {
    fileName?: string;
    charCount: number;
    wordCount: number;
    detectedName?: string;
    contactInfo: {
      email?: string;
      phone?: string;
      linkedIn?: string;
      gitHub?: string;
      location?: string;
      portfolio?: string;
    };
    detectedSections: {
      title: string;
      isStandard: boolean;
      suggestedTitle?: string;
      contentSnippet: string;
    }[];
    extractedSkills: string[];
    quantifiedBulletsPercentage: number;
    totalBulletsCount: number;
    quantifiedBulletsCount: number;
  };
  targetJobFit?: JobSuitabilityResult;
  allJobMatches: JobSuitabilityResult[];
  atsReadiness: {
    score: number;
    rating: 'Excellent' | 'Good' | 'Needs Optimization' | 'Critical Issues';
    checks: ATSCheckItem[];
    bulletAudits: BulletAuditItem[];
    sectionSuggestions: {
      current: string;
      standardized: string;
      reason: string;
    }[];
    formattingTips: string[];
  };
  skillGaps: {
    matchedCount: number;
    partialCount: number;
    missingCount: number;
    gapItems: SkillGapItem[];
    topRecommendedCourses: FreeCourse[];
  };
  benchmarking: BenchmarkComparison;
  aiExecutiveSummary?: string;
}

export interface SampleResume {
  id: string;
  name: string;
  role: string;
  tag: string;
  content: string;
  idealTargetJobId?: string;
}
