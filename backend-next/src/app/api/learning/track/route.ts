import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@/lib/auth';
import { z } from 'zod';

const trackSchema = z.object({
  duration: z.number().optional(), // minutes
  courseCount: z.number().optional(),
  quizScore: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const auth = getAuth(req as any);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { duration, courseCount, quizScore } = trackSchema.parse(body);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to date only

    await prisma.learningStat.upsert({
      where: {
        userId_date: {
          userId: auth.userId,
          date: today,
        },
      },
      create: {
        userId: auth.userId,
        date: today,
        duration: duration || 0,
        courseCount: courseCount || 0,
        quizScore: quizScore || 0,
      },
      update: {
        duration: { increment: duration || 0 },
        courseCount: { increment: courseCount || 0 },
        quizScore: { increment: quizScore || 0 },
      },
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}