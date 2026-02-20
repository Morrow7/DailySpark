import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || process.env.EXPO_PUBLIC_DOUBAO_API_KEY;
const DOUBAO_ENDPOINT = process.env.DOUBAO_ENDPOINT || process.env.EXPO_PUBLIC_DOUBAO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || process.env.EXPO_PUBLIC_DOUBAO_MODEL || 'doubao-seed-1-8-251228';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req); // Returns { userId, ... } or null
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messages, type = 'text' } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Membership Check for Voice Chat
    if (type === 'voice') {
      const membership = await prisma.userMembership.findUnique({
        where: { userId: auth.userId },
      });

      const isMember = membership && membership.level !== 'free' && (!membership.endTime || new Date(membership.endTime) > new Date());
      
      if (!isMember) {
        return NextResponse.json({ 
          code: 'VOICE_FORBIDDEN_NON_MEMBER', 
          message: '您当前为非会员，无法使用电话语音聊天。开通会员以解锁语音通话。' 
        }, { status: 403 });
      }
    }

    // Call Doubao API
    const response = await fetch(DOUBAO_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: DOUBAO_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful English tutor. Please reply in English.' },
          ...messages
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Doubao API Error:', errorData);
      return NextResponse.json({ error: errorData.message || 'Doubao API Error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
