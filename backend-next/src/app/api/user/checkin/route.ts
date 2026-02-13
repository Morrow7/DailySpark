import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const auth = getAuth(req as any);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.checkinLog.findUnique({
      where: {
        userId_checkinDate: {
          userId: auth.userId,
          checkinDate: today,
        },
      },
    });

    if (existingLog) {
      return NextResponse.json({ message: 'Already checked in', continuousDays: existingLog.continuousDays });
    }

    // Check yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayLog = await prisma.checkinLog.findUnique({
      where: {
        userId_checkinDate: {
          userId: auth.userId,
          checkinDate: yesterday,
        },
      },
    });

    const continuousDays = yesterdayLog ? yesterdayLog.continuousDays + 1 : 1;

    await prisma.checkinLog.create({
      data: {
        userId: auth.userId,
        checkinDate: today,
        continuousDays,
      },
    });

    return NextResponse.json({ status: 'success', continuousDays });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}