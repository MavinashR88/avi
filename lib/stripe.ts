import Stripe from 'stripe';

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  cached = new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
  return cached;
}

export const STRIPE_PLAN = {
  unitAmount: 1500,
  currency: 'usd',
  interval: 'month' as const,
  productName: 'Avista Pro',
  monthlyProposalCap: 30,
};

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  );
}
