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

// gemini-1.5-flash returns 404 on v1beta as of 2026 (model deprecated by Google).
// gemini-2.0-flash is the current Flash-class generation and matches the spec intent.
export const PROPOSAL_MODEL = 'gemini-2.0-flash';

export function getProposalModel(): GenerativeModel {
  return getGemini().getGenerativeModel({ model: PROPOSAL_MODEL });
}
