import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const auth = getAuth(req as any);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        membership: true,
        checkinLogs: {
          orderBy: { checkinDate: 'desc' },
          take: 1,
        },
        learningStats: {
          orderBy: { date: 'desc' },
          take: 7, // Last 7 days
        },
        ranking: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate total duration from stats
    const totalDuration = user.learningStats.reduce((acc, curr) => acc + curr.duration, 0);
    const continuousDays = user.checkinLogs[0]?.continuousDays || 0;

    // Check if VIP expired
    let vipDays = 0;
    if (user.membership?.endTime && user.membership.endTime > new Date()) {
      const diffTime = user.membership.endTime.getTime() - new Date().getTime();
      vipDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      nickname: user.name || 'User',
      avatar: user.avatar,
      vipDays,
      totalDuration,
      courseCount: user.learningStats.reduce((acc, curr) => acc + curr.courseCount, 0),
      continuousDays,
      weeklyRank: user.ranking?.rankPosition || '-',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}