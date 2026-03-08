
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@/lib/auth';
import { PaymentService, PaymentMethod } from '@/lib/payment/service';
import { z } from 'zod';

const createOrderSchema = z.object({
  planId: z.number(),
  method: z.enum(['wechat', 'alipay']),
});

export async function POST(req: NextRequest) {
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { planId, method } = createOrderSchema.parse(body);

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 1. Create Order
    const order = await prisma.order.create({
      data: {
        userId: auth.userId,
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        subject: `Recharge: ${plan.name}`,
        paymentMethod: method,
      }
    });

    // 2. Call Payment Provider
    const provider = PaymentService.getProvider(method as PaymentMethod);
    const result = await provider.createOrder({
      orderId: order.id,
      amount: Number(plan.price),
      subject: `DailySpark - ${plan.name}`,
      description: plan.description || undefined
    });

    if (!result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'failed' }
      });
      return NextResponse.json({ error: result.message || 'Payment creation failed' }, { status: 500 });
    }

    // 3. Save Payment Record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        channel: method,
        amount: plan.price,
        currency: plan.currency,
        status: 'pending',
        transactionId: result.transactionId,
      }
    });

    return NextResponse.json({
      orderId: order.id,
      ...result.payload
    });

  } catch (error: any) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
