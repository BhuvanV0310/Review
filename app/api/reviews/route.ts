import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { analyzeSentiment } from '@/lib/ai';

// Simple in-memory rate limiter: 5 requests per minute per user
const rateMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const LIMIT = 5;

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const arr = rateMap.get(userId) ?? [];
  const recent = arr.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    rateMap.set(userId, recent);
    return true;
  }
  recent.push(now);
  rateMap.set(userId, recent);
  return false;
}

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        branchId: true,
        text: true,
        rating: true,
        sentiment: true,
        category: true,
        sentimentScore: true,
        sentimentLabel: true,
        feedbackCategory: true,
        aiConfidence: true,
        analyzedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (rateLimited(user.id)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { text, rating, branchId, feedbackCategory } = body as {
      text: string;
      rating?: number;
      branchId?: string;
      feedbackCategory?: string;
    };

    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return NextResponse.json({ error: 'Text is required (min 3 chars)' }, { status: 400 });
    }

    // Analyze sentiment
    const ai = await analyzeSentiment(text);

    // Persist
    const created = await prisma.review.create({
      data: {
        userId: user.id,
        branchId: branchId ?? null,
        text: text.trim(),
        rating: typeof rating === 'number' ? Math.max(1, Math.min(5, Math.floor(rating))) : null,
        // legacy fields for backward compatibility
        sentiment: ai.label,
        category: feedbackCategory ?? null,
        // new fields
        sentimentScore: ai.score,
        sentimentLabel: ai.label as any,
        feedbackCategory: feedbackCategory ? (feedbackCategory.toUpperCase() as any) : null,
        aiConfidence: ai.confidence,
        analyzedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        text: true,
        rating: true,
        sentimentScore: true,
        sentimentLabel: true,
        feedbackCategory: true,
        aiConfidence: true,
        analyzedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ review: created });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
