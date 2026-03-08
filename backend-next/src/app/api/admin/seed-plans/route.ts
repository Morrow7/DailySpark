
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  const plans = [
    {
      name: 'Monthly VIP',
      description: 'Unlock all premium features for 30 days.',
      price: 19.00,
      duration: 30,
      level: 'vip'
    },
    {
      name: 'Quarterly VIP',
      description: 'Unlock all premium features for 90 days. Save 10%.',
      price: 49.00,
      duration: 90,
      level: 'vip'
    },
    {
      name: 'Yearly VIP',
      description: 'Unlock all premium features for 365 days. Best Value!',
      price: 168.00,
      duration: 365,
      level: 'vip'
    },
    {
      name: 'Lifetime SVIP',
      description: 'Permanent access to all features.',
      price: 398.00,
      duration: 36500, // 100 years
      level: 'svip'
    }
  ];

  try {
    for (const plan of plans) {
      const existing = await prisma.membershipPlan.findFirst({ where: { name: plan.name } });
      if (!existing) {
        await prisma.membershipPlan.create({ data: plan });
      }
    }
    return NextResponse.json({ success: true, message: 'Plans seeded' });
  } catch (error) {
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}
