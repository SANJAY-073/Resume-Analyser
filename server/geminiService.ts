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
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Deep Review failed (using fallback):', error);
    return null;
  }
}

export async function rewriteBulletWithGemini(
  originalBullet: string,
  targetRole?: string
): Promise<{ rewrittenBullet: string; metricIncluded: string; actionVerb: string } | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  try {
    const prompt = `Rewrite the following resume bullet point for a ${targetRole || 'Software Engineer'} role into a high-converting, quantified accomplishment statement using Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]").

Original Bullet: "${originalBullet}"

Return strictly valid JSON:
{
  "rewrittenBullet": "Strong action verb + clear task + specific quantified outcome (%, $, latency, throughput, scale)",
  "metricIncluded": "e.g. 35% latency reduction, $2.4M ARR",
  "actionVerb": "e.g. Architected, Spearheaded"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const text = response.text?.trim();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini bullet rewrite failed:', error);
    return null;
  }
}
