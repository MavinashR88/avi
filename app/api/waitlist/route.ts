import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = typeof (body as { email?: unknown }).email === 'string'
    ? ((body as { email: string }).email).trim().toLowerCase()
    : '';

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'That email looks off. Try again?' }, { status: 400 });
  }

  console.log(JSON.stringify({ event: 'waitlist.signup', email, ts: new Date().toISOString() }));

  return NextResponse.json({ ok: true });
}
