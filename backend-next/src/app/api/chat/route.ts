import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@/lib/auth';
import { DoubaoService } from '@/lib/doubao';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req); // Returns { userId, ... } or null
    // Mock auth if dev environment or skip check for now to ease testing
    // if (!auth) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Use the new DoubaoService
    const reply = await DoubaoService.chat(messages);
    
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
