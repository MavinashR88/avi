import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;

export function getGemini(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

// Spec asked for gemini-1.5-flash, but it 404s on v1beta as of 2026 (deprecated).
// gemini-2.0-flash returns 429 free_tier limit: 0 on our key — not on free tier.
// gemini-2.5-flash is the current free-tier Flash-class model.
export const PROPOSAL_MODEL = 'gemini-2.5-flash';

export function getProposalModel(): GenerativeModel {
  return getGemini().getGenerativeModel({ model: PROPOSAL_MODEL });
}
