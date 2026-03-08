import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@/lib/auth';
import { z } from 'zod';

const orderSchema = z.object({
  planId: z.number(),
  paymentMethod: z.enum(['alipay', 'wechat', 'apple']),
});

export async function POST(req: Request) {
  try {
    // Auth Check
    const auth = getAuth(req as any);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId, paymentMethod } = orderSchema.parse(body);

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create Order
    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        planId,
        amount: plan.price,
        status: 'pending',
        paymentMethod,
        orderNo: `ORD-${Date.now()}-${auth.userId}`, // Simple order ID
      },
    });

    // Mock payment gateway URL
    const paymentUrl = `https://mock-payment.com/pay?orderNo=${order.orderNo}&amount=${order.amount}`;

    return NextResponse.json({
      orderId: order.id,
      orderNo: order.orderNo,
      paymentUrl,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}