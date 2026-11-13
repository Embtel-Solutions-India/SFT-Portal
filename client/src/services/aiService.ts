/**
 * AI features (resume parsing, advisory matching) — all calls go through the server,
 * which holds the Gemini key. Nothing AI-related runs in or is keyed from the browser.
 */
import { Candidate, Job } from '../types';
import { api } from './api';

export interface ParsedResumeResponse {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  skills: Array<{ name: string; confidence: number | null }>;
  experienceYears: number | null;
  education: string;
  summary: string;
  detectedLanguage: string;
  parseConfidence: number | null;
  modelUsed: string;
}

export interface AdvisoryMatchResult {
  candidateId: string;
  jobId: string;
  overallScore: number | null;
  factors: {
    skillsAlignment: number | null;
    experienceRelevance: number | null;
    domainFit: number | null;
    growthPotential: number | null;
  };
  matchingStrengths: string[];
  skillGaps: string[];
  advisoryReasoning: string;
  recruiterActionTip: string;
  governanceNotice: string;
  isLiveAiCall: boolean;
  modelUsed: string;
}

const GOVERNANCE_NOTICE = 'Advisory decision support only. No candidate is rejected without human recruiter review.';

/** Throws with a readable message if parsing is unavailable — results are never fabricated. */
export async function parseResume(resumeText: string): Promise<ParsedResumeResponse> {
  const res = await api.ai.parseResume(resumeText);
  return { ...res.data, modelUsed: res.provider };
}

export async function calculateAdvisoryMatch(candidate: Candidate, job: Job): Promise<AdvisoryMatchResult> {
  const res = await api.ai.match(candidate.id, job.id);
  return {
    ...res.data,
    candidateId: candidate.id,
    jobId: job.id,
    governanceNotice: GOVERNANCE_NOTICE,
    isLiveAiCall: res.provider !== 'rule-based',
    modelUsed: res.provider
  };
}
