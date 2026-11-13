import { Candidate, Job } from '../types/index.js';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const PARSE_VERSION = 'parse-v1';
const MATCH_VERSION = 'match-v1';

export const geminiConfigured = () => !!process.env.GEMINI_API_KEY;

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

export class AiUnavailableError extends Error {}

/** Call Gemini with a JSON response schema. Retries 429/5xx up to 2 times (FR-03 bounded retry). */
async function generateJson(system: string, parts: Part[], responseSchema: object): Promise<any> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiUnavailableError('GEMINI_API_KEY is not configured.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.1, responseMimeType: 'application/json', responseSchema }
  });

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body,
      signal: AbortSignal.timeout(60_000)
    });
    if (res.ok) {
      const json: any = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
      return JSON.parse(text);
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= 2) {
      const detail = await res.text().catch(() => '');
      throw new AiUnavailableError(`Gemini request failed (${res.status}): ${detail.slice(0, 200)}`);
    }
    await new Promise(r => setTimeout(r, 1000 * 2 ** attempt));
  }
}

// ---------- schema validation: keep only well-typed values, never invent ----------
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const num = (v: unknown, min = 0, max = 100) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : null;
const strArr = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

export interface ParsedResume {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  skills: { name: string; confidence: number | null }[];
  experienceYears: number | null;
  education: string;
  certifications: string[];
  summary: string;
  detectedLanguage: string;
  parseConfidence: number | null;
}

export interface AiMeta {
  provider: string;
  model: string;
  version: string;
  ms: number;
}

const RESUME_SCHEMA = {
  type: 'OBJECT',
  properties: {
    fullName: { type: 'STRING' },
    email: { type: 'STRING' },
    phone: { type: 'STRING' },
    location: { type: 'STRING' },
    targetRole: { type: 'STRING' },
    skills: {
      type: 'ARRAY',
      items: { type: 'OBJECT', properties: { name: { type: 'STRING' }, confidence: { type: 'NUMBER' } }, required: ['name'] }
    },
    experienceYears: { type: 'NUMBER', nullable: true },
    education: { type: 'STRING' },
    certifications: { type: 'ARRAY', items: { type: 'STRING' } },
    summary: { type: 'STRING' },
    detectedLanguage: { type: 'STRING' },
    parseConfidence: { type: 'NUMBER' }
  },
  required: ['fullName', 'email', 'phone', 'skills']
};

const RESUME_SYSTEM = `You extract structured candidate data from resumes for a staffing platform.
Rules: use ONLY information present in the document. If a value is missing or unclear, return an empty string, empty array, or null. Never guess or fabricate.
skills[].confidence and parseConfidence are 0-100 reflecting how clearly the document states the value.
experienceYears is total professional experience in years, or null if it cannot be determined.`;

export function validateParsedResume(raw: any): ParsedResume {
  return {
    fullName: str(raw?.fullName),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(raw?.email)) ? str(raw.email).toLowerCase() : '',
    phone: str(raw?.phone),
    location: str(raw?.location),
    targetRole: str(raw?.targetRole),
    skills: Array.isArray(raw?.skills)
      ? raw.skills.map((s: any) => ({ name: str(s?.name), confidence: num(s?.confidence) })).filter((s: any) => s.name)
      : [],
    experienceYears: num(raw?.experienceYears, 0, 60),
    education: str(raw?.education),
    certifications: strArr(raw?.certifications),
    summary: str(raw?.summary),
    detectedLanguage: str(raw?.detectedLanguage),
    parseConfidence: num(raw?.parseConfidence)
  };
}

/** Parse a resume. Pass plain text, or a PDF buffer (Gemini reads PDFs natively). */
export async function parseResume(input: { text: string } | { pdf: Buffer }): Promise<{ data: ParsedResume; meta: AiMeta }> {
  const start = Date.now();
  const part: Part = 'text' in input
    ? { text: input.text.slice(0, 250_000) }
    : { inlineData: { mimeType: 'application/pdf', data: input.pdf.toString('base64') } };
  const raw = await generateJson(RESUME_SYSTEM, [part], RESUME_SCHEMA);
  const meta = { provider: 'gemini', model: MODEL, version: PARSE_VERSION, ms: Date.now() - start };
  console.log(`[AI] resume parsed model=${meta.model} version=${meta.version} ms=${meta.ms}`);
  return { data: validateParsedResume(raw), meta };
}

export interface AdvisoryMatch {
  overallScore: number | null;
  factors: { skillsAlignment: number | null; experienceRelevance: number | null; domainFit: number | null; growthPotential: number | null };
  matchingStrengths: string[];
  skillGaps: string[];
  advisoryReasoning: string;
  recruiterActionTip: string;
}

const MATCH_SCHEMA = {
  type: 'OBJECT',
  properties: {
    overallScore: { type: 'NUMBER' },
    factors: {
      type: 'OBJECT',
      properties: {
        skillsAlignment: { type: 'NUMBER' },
        experienceRelevance: { type: 'NUMBER' },
        domainFit: { type: 'NUMBER' },
        growthPotential: { type: 'NUMBER' }
      }
    },
    matchingStrengths: { type: 'ARRAY', items: { type: 'STRING' } },
    skillGaps: { type: 'ARRAY', items: { type: 'STRING' } },
    advisoryReasoning: { type: 'STRING' },
    recruiterActionTip: { type: 'STRING' }
  },
  required: ['overallScore', 'factors', 'matchingStrengths', 'skillGaps', 'advisoryReasoning']
};

const MATCH_SYSTEM = `You are an advisory candidate-job matching assistant. Your output supports a human recruiter and is never a hiring or rejection decision.
Score 0-100 using only the data given. Name concrete matched and missing skills. Note data gaps instead of assuming.`;

export async function matchCandidate(candidate: Candidate, job: Job): Promise<{ data: AdvisoryMatch; meta: AiMeta }> {
  const start = Date.now();
  const prompt = `CANDIDATE
Target role: ${candidate.targetRole}
Experience: ${candidate.experienceYears} years
Education: ${candidate.education}
Skills: ${candidate.skills.join(', ')}

JOB
Title: ${job.title}
Employer: ${job.employer}
Location: ${job.location} (${job.employmentType})
Experience required: ${job.experienceRange}
Required skills: ${job.requiredSkills.join(', ')}
Description: ${job.description}`;
  // Candidate name/contact deliberately omitted: matching must not depend on identity.
  const raw = await generateJson(MATCH_SYSTEM, [{ text: prompt }], MATCH_SCHEMA);
  const meta = { provider: 'gemini', model: MODEL, version: MATCH_VERSION, ms: Date.now() - start };
  console.log(`[AI] match candidate=${candidate.id} job=${job.id} model=${meta.model} version=${meta.version} ms=${meta.ms}`);
  return {
    data: {
      overallScore: num(raw?.overallScore),
      factors: {
        skillsAlignment: num(raw?.factors?.skillsAlignment),
        experienceRelevance: num(raw?.factors?.experienceRelevance),
        domainFit: num(raw?.factors?.domainFit),
        growthPotential: num(raw?.factors?.growthPotential)
      },
      matchingStrengths: strArr(raw?.matchingStrengths),
      skillGaps: strArr(raw?.skillGaps),
      advisoryReasoning: str(raw?.advisoryReasoning),
      recruiterActionTip: str(raw?.recruiterActionTip)
    },
    meta
  };
}

/** Deterministic skill-overlap match used when Gemini is unavailable. Transparent, not AI. */
export function ruleBasedMatch(candidate: Candidate, job: Job): AdvisoryMatch {
  const have = candidate.skills.map(s => s.toLowerCase());
  const matched = job.requiredSkills.filter(s => have.includes(s.toLowerCase()));
  const missing = job.requiredSkills.filter(s => !have.includes(s.toLowerCase()));
  const skills = job.requiredSkills.length ? Math.round((matched.length / job.requiredSkills.length) * 100) : null;
  return {
    overallScore: skills,
    factors: { skillsAlignment: skills, experienceRelevance: null, domainFit: null, growthPotential: null },
    matchingStrengths: matched.map(s => `Has required skill: ${s}`),
    skillGaps: missing,
    advisoryReasoning: `Rule-based skill overlap only (${matched.length}/${job.requiredSkills.length} required skills). AI analysis unavailable.`,
    recruiterActionTip: 'Review the full profile manually.'
  };
}
