import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe, STRIPE_PLAN, getAppUrl } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let cachedPriceId: string | null = null;

async function ensurePriceId(): Promise<string> {
  if (cachedPriceId) return cachedPriceId;
  if (process.env.STRIPE_PRICE_ID) {
    cachedPriceId = process.env.STRIPE_PRICE_ID;
    return cachedPriceId;
  }

  const stripe = getStripe();
  const products = await stripe.products.search({
    query: `active:'true' AND name:'${STRIPE_PLAN.productName}'`,
    limit: 1,
  });
  let product = products.data[0];
  if (!product) {
    product = await stripe.products.create({ name: STRIPE_PLAN.productName });
  }

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 10,
  });
  let price = prices.data.find(
    (p) =>
      p.unit_amount === STRIPE_PLAN.unitAmount &&
      p.currency === STRIPE_PLAN.currency &&
      p.recurring?.interval === STRIPE_PLAN.interval,
  );
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: STRIPE_PLAN.unitAmount,
      currency: STRIPE_PLAN.currency,
      recurring: { interval: STRIPE_PLAN.interval },
    });
  }
  cachedPriceId = price.id;
  return price.id;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: 'Server is missing STRIPE_SECRET_KEY' },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId = await ensurePriceId();
  const appUrl = getAppUrl();

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app?subscribed=1`,
    cancel_url: `${appUrl}/subscribe?cancelled=1`,
    client_reference_id: user.id,
    metadata: { userId: user.id },
    allow_promotion_codes: true,
  });

  if (!checkout.url) {
    return NextResponse.json(
      { error: 'Stripe did not return a checkout URL' },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: checkout.url });
}
