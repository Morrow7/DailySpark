import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  code: z.string().min(4), // Mock verification code
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, code, newPassword } = resetSchema.parse(body);

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400 });
    }

    // Mock verification code check
    // In production, verify code from Redis/DB
    if (code !== '123456') {
       return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
