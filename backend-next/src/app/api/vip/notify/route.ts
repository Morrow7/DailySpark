import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validate signature here in real world
    const { orderNo, status } = body;

    if (status !== 'success') {
      return NextResponse.json({ status: 'ok' }); // Just ack
    }

    const order = await prisma.order.findUnique({
      where: { orderNo },
      include: { plan: true },
    });

    if (!order || order.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
    }

    // Update Order & VIP in transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'paid', paidAt: new Date() },
      });

      const currentVip = await tx.userMembership.findUnique({
        where: { userId: order.userId },
      });

      let startTime = new Date();
      let endTime = new Date();
      
      // If already VIP and not expired, extend
      if (currentVip && currentVip.endTime && currentVip.endTime > new Date()) {
        startTime = currentVip.endTime;
        endTime = new Date(startTime.getTime() + order.plan.duration * 24 * 60 * 60 * 1000);
      } else {
        // New or expired
        endTime = new Date(startTime.getTime() + order.plan.duration * 24 * 60 * 60 * 1000);
      }

      await tx.userMembership.upsert({
        where: { userId: order.userId },
        create: {
          userId: order.userId,
          planId: order.planId,
          level: 'vip',
          startTime,
          endTime,
        },
        update: {
          planId: order.planId,
          level: 'vip',
          startTime: currentVip?.startTime ?? startTime, // Keep original start if valid
          endTime,
        },
      });
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}