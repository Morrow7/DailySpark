import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@/lib/auth';
import { z } from 'zod';

const wordSchema = z.object({
  word: z.string().min(1),
  meaning: z.string().min(1),
  phonetic: z.string().optional(),
  partOfSpeech: z.string().optional(),
  example: z.string().optional(),
  level: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const words = await prisma.word.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(words);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = wordSchema.parse(body);

    // Check duplicate
    const existing = await prisma.word.findFirst({
      where: {
        userId: auth.userId,
        word: data.word,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Word already exists' }, { status: 400 });
    }

    const word = await prisma.word.create({
      data: {
        ...data,
        userId: auth.userId,
      },
    });

    return NextResponse.json(word);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save word' }, { status: 500 });
  }
}
