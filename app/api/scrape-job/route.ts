import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const BodySchema = z.object({
  url: z.string().url().max(2000),
});

function extractFromNextData(html: string): { title: string; description: string } | null {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    const data = JSON.parse(match[1]);
    const job =
      data?.props?.pageProps?.job ??
      data?.props?.pageProps?.initialProps?.job ??
      data?.props?.pageProps?.data?.job ??
      null;
    if (!job) return null;
    const title = (job.title ?? job.jobTitle ?? '') as string;
    const description = (job.description ?? job.jobDescription ?? '') as string;
    if (description.length >= 50) return { title, description };
  } catch {}
  return null;
}

function extractFromMeta(html: string): { title: string; description: string } | null {
  const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1];
  const pageTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const ogDesc = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1];
  const metaDesc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1];

  const title = (ogTitle ?? pageTitle ?? '').trim();
  const description = (ogDesc ?? metaDesc ?? '').trim();

  if (description.length >= 50) return { title, description };
  return null;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 422 });
  }

  const { url } = parsed.data;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 422 });
  }

  if (!parsedUrl.hostname.endsWith('upwork.com')) {
    return NextResponse.json({ error: 'Only Upwork URLs are supported' }, { status: 422 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Could not fetch job page (HTTP ${response.status}). Upwork may be blocking automated requests — paste the description manually.`,
        },
        { status: 422 },
      );
    }

    const html = await response.text();
    const result = extractFromNextData(html) ?? extractFromMeta(html);

    if (!result || !result.description) {
      return NextResponse.json(
        {
          error:
            'Could not extract job description. Upwork may require login or is blocking the request — paste the description manually.',
        },
        { status: 422 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('timeout') || msg.includes('abort') || msg.includes('AbortError')) {
      return NextResponse.json(
        { error: 'Request timed out — paste the description manually.' },
        { status: 422 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch job page — paste the description manually.' },
      { status: 422 },
    );
  }
}
