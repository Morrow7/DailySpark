import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}