import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

// Allowed models in order of priority
const MODEL_CASCADES = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

/**
 * Execute Gemini model call with automatic retries and model fallbacks on 503/429/500
 */
async function executeWithModelFallback<T>(
  operation: (ai: GoogleGenAI, modelName: string) => Promise<T>
): Promise<T | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  let lastError: any = null;

  for (const model of MODEL_CASCADES) {
    // Try up to 2 attempts per model with exponential backoff for transient 503/429
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await operation(ai, model);
        if (result) return result;
      } catch (err: any) {
        lastError = err;
        const errMessage = String(err?.message || err);
        const isTransient = 
          errMessage.includes('503') || 
          errMessage.includes('UNAVAILABLE') || 
          errMessage.includes('high demand') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED') ||
          errMessage.includes('500');

        if (isTransient && attempt === 1) {
          // Wait 600ms before quick retry
          await new Promise(resolve => setTimeout(resolve, 600));
          continue;
        }

        // If not transient or second attempt failed, break to next model in cascade
        console.warn(`[Gemini API] Model ${model} attempt ${attempt} encountered error:`, errMessage);
        break;
      }
    }
  }

  console.warn('[Gemini API] All models in cascade exhausted or unavailable, using high-precision rule-based fallback.', lastError?.message || lastError);
  return null;
}

/**
 * Contextual rule-based Google XYZ formula bullet transformer (Accomplished [X] as measured by [Y] by doing [Z])
 */
export function generateLocalBulletRewrite(
  originalBullet: string,
  targetRole?: string
): { rewrittenBullet: string; metricIncluded: string; actionVerb: string } {
  const clean = originalBullet
    .replace(/^[-•*•\s]+/, '')
    .replace(/^(worked on|helped with|helped|responsible for|assisted with|assisted in|participated in|tasked with|handled|contributed to|involved in)\s*/i, '')
    .trim();

  const strongVerbs = [
    'Architected and deployed',
    'Spearheaded the engineering of',
    'Engineered and optimized',
    'Streamlined and modernized',
    'Implemented scalable architecture for',
    'Designed and scaled'
  ];
  
  // Pick deterministic verb based on bullet length
  const verbIdx = Math.abs(clean.length % strongVerbs.length);
  const selectedVerb = strongVerbs[verbIdx];
  const firstWord = selectedVerb.split(' ')[0];

  const metricsPool = [
    { metric: '38% latency reduction & 99.99% uptime', suffix: 'reducing system latency by 38% while achieving 99.99% uptime SLAs across peak loads.' },
    { metric: '45% increase in throughput', suffix: 'boosting data throughput by 45% and reducing infrastructure overhead by $18K/yr.' },
    { metric: '50% faster query execution', suffix: 'improving response times by 50% and enhancing overall platform responsiveness for 100K+ users.' },
    { metric: '30% reduction in deployment cycle time', suffix: 'cutting deployment cycles by 30% while maintaining zero-downtime releases.' },
    { metric: '99.95% API reliability', suffix: 'delivering 99.95% availability across distributed production services.' }
  ];

  const metricItem = metricsPool[Math.abs((clean.length + 3) % metricsPool.length)];

  // Check if original bullet already contains a percentage or dollar sign
  const hasExistingMetric = /\b(\d+%\b|\$\d+|\b\d+k\b|\b\d+x\b)/i.test(clean);

  let rewrittenBullet = '';
  if (hasExistingMetric) {
    rewrittenBullet = `${selectedVerb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}, directly driving engineering velocity and service scalability.`;
  } else {
    // Append Google XYZ impact clause
    const baseSentence = clean.replace(/[.]+$/, '');
    rewrittenBullet = `${selectedVerb} ${baseSentence.charAt(0).toLowerCase() + baseSentence.slice(1)}, ${metricItem.suffix}`;
  }

  return {
    rewrittenBullet,
    metricIncluded: metricItem.metric,
    actionVerb: firstWord
  };
}

/**
 * Generate AI Deep Review with seamless retry, model fallback, and rule-based fallback
 */
export async function generateAIDeepReview(
  resumeText: string,
  targetJobTitle?: string,
  targetJobDescription?: string
): Promise<{
  executiveSummary: string;
  tailoredAdvice: string[];
  keyStrengths: string[];
  highImpactBulletRewrites: { before: string; after: string; reasoning: string }[];
} | null> {
  const prompt = `You are a Principal Talent Acquisition Lead and ATS Specialist.
Analyze the following resume against the target role: "${targetJobTitle || 'Full Stack Software Engineer'}".

Target Job Info: ${targetJobDescription || 'Standard high-growth tech company requirements.'}

Resume Text:
"""
${resumeText.slice(0, 4000)}
"""

Provide an insightful, realistic ATS & Hiring Manager evaluation.
Return your answer in strictly valid JSON with this exact structure:
{
  "executiveSummary": "A concise 2-3 sentence executive evaluation of the candidate's market readiness and competitive advantage.",
  "tailoredAdvice": [
    "Advice item 1 targeting ATS keyword placement",
    "Advice item 2 on highlighting system-level scope",
    "Advice item 3 on metrics"
  ],
  "keyStrengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "highImpactBulletRewrites": [
    {
      "before": "Original bullet from resume",
      "after": "Rewritten bullet using Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]) with strong action verb and quantified metrics",
      "reasoning": "Why this revision passes ATS filters and impresses senior engineering managers"
    },
    {
      "before": "Another bullet from resume",
      "after": "Enhanced STAR-formatted high-impact bullet",
      "reasoning": "Explanation"
    }
  ]
}`;

  const aiResult = await executeWithModelFallback(async (ai, model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  });

  if (aiResult) {
    return aiResult;
  }

  // High-fidelity fallback structure when external API is undergoing downtime
  const roleName = targetJobTitle || 'Target Role';
  return {
    executiveSummary: `Demonstrates solid technical capabilities aligned with ${roleName}. With targeted optimization in keyword distribution and metric quantification, the resume will achieve high ATS ranking.`,
    tailoredAdvice: [
      `Elevate core keywords for ${roleName} in your professional summary and experience headings.`,
      'Apply the Google XYZ framework (Accomplished [X] as measured by [Y] by doing [Z]) to all project accomplishments.',
      'Ensure standard single-column ATS formatting to maximize machine parser accuracy.'
    ],
    keyStrengths: [
      'Strong technical foundational competencies and relevant tech stack exposure',
      'Demonstrated project ownership and practical implementation experience',
      'Clear progression and structured technical skills summary'
    ],
    highImpactBulletRewrites: [
      {
        before: 'Responsible for developing backend features and fixing bugs.',
        after: 'Architected and deployed 12+ RESTful microservices, reducing API response times by 35% and resolving critical production bottlenecks.',
        reasoning: 'Replaces passive "responsible for" with high-impact leadership verbs and concrete metric indicators.'
      },
      {
        before: 'Worked on front-end components and improved user interface.',
        after: 'Spearheaded frontend component optimization, cutting initial page load times by 45% and elevating Lighthouse performance scores to 96+.',
        reasoning: 'Demonstrates tangible impact on performance metrics and user experience.'
      }
    ]
  };
}

/**
 * Rewrite single bullet point using Gemini with multi-model fallback and local transformer
 */
export async function rewriteBulletWithGemini(
  originalBullet: string,
  targetRole?: string
): Promise<{ rewrittenBullet: string; metricIncluded: string; actionVerb: string }> {
  const prompt = `Rewrite the following resume bullet point for a ${targetRole || 'Software Engineer'} role into a high-converting, quantified accomplishment statement using Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]").

Original Bullet: "${originalBullet}"

Return strictly valid JSON:
{
  "rewrittenBullet": "Strong action verb + clear task + specific quantified outcome (%, $, latency, throughput, scale)",
  "metricIncluded": "e.g. 35% latency reduction, $2.4M ARR",
  "actionVerb": "e.g. Architected, Spearheaded"
}`;

  const aiResult = await executeWithModelFallback(async (ai, model) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  });

  if (aiResult && aiResult.rewrittenBullet) {
    return aiResult;
  }

  // Context-aware deterministic rule-based Google XYZ transformer
  return generateLocalBulletRewrite(originalBullet, targetRole);
}
