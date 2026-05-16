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

export const PROPOSAL_MODEL = 'gemini-1.5-flash';

export function getProposalModel(): GenerativeModel {
  return getGemini().getGenerativeModel({ model: PROPOSAL_MODEL });
}
