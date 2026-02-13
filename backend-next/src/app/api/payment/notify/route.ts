
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // In real world, parse XML/Form and verify signature
    // Mock: Accepts JSON to simulate callback
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { plan: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'paid') {
      return NextResponse.json({ message: 'Already paid' });
    }

    if (status === 'success') {
      // 1. Update Order
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'paid',
          paymentTime: new Date()
        }
      });

      // 2. Update Payment Record
      await prisma.payment.updateMany({
        where: { orderId: orderId },
        data: { status: 'success' }
      });

      // 3. Grant Membership
      if (order.plan) {
        const now = new Date();
        const membership = await prisma.userMembership.findUnique({
          where: { userId: order.userId }
        });

        let expireAt = membership?.expireAt && membership.expireAt > now 
          ? new Date(membership.expireAt) 
          : now;
        
        expireAt.setDate(expireAt.getDate() + order.plan.duration);

        await prisma.userMembership.upsert({
          where: { userId: order.userId },
          update: {
            level: order.plan.level,
            expireAt: expireAt,
            updatedAt: now
          },
          create: {
            userId: order.userId,
            level: order.plan.level,
            expireAt: expireAt
          }
        });
      }
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'failed' }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
