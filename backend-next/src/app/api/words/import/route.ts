import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuth } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { z } from 'zod';

// Define schema for validation
const importRowSchema = z.object({
  word: z.string().min(1),
  meaning: z.string().min(1),
  phonetic: z.string().optional(),
  partOfSpeech: z.string().optional(),
  level: z.string().optional(),
  example_en: z.string().optional(),
  example_cn: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 1. Auth Check
  const auth = getAuth(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Size limit check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // 3. Read File Buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(sheet);

    if (rawData.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    // 4. Validate & Normalize Data
    const validWords: any[] = [];
    const errors: any[] = [];

    // Helper to map Chinese keys to English
    const mapKey = (row: any, key: string, cnKey: string) => row[key] || row[cnKey];

    rawData.forEach((row: any, index) => {
      try {
        const item = {
          word: mapKey(row, 'word', '单词'),
          meaning: mapKey(row, 'meaning', '释义'),
          phonetic: mapKey(row, 'phonetic', '音标'),
          partOfSpeech: mapKey(row, 'partOfSpeech', '词性'),
          level: mapKey(row, 'level', '等级'),
          example_en: mapKey(row, 'example', '例句'), // Simple mapping
          // If complex example parsing is needed, add logic here
        };

        const parsed = importRowSchema.parse(item);
        validWords.push(parsed);
      } catch (e: any) {
        errors.push({ row: index + 2, error: e.errors || 'Invalid format' });
      }
    });

    // 5. Deduplication (Check existing words in DB)
    // Optimize: Fetch all existing words in one query instead of N queries
    // Only fetch 'word' field for checking
    const existingWords = await prisma.word.findMany({
      where: { userId: auth.userId },
      select: { word: true },
    });
    const existingSet = new Set(existingWords.map(w => w.word.toLowerCase()));

    const newWordsToInsert = validWords.filter(w => !existingSet.has(w.word.toLowerCase()));
    const duplicatesCount = validWords.length - newWordsToInsert.length;

    // 6. Batch Insert (Transaction)
    // Prisma createMany is fast but doesn't support nested relations (Meanings/Examples) easily in one go.
    // For "Meanings table" requirement, we need to iterate or use createMany for words then createMany for meanings.
    // To keep it atomic and simple for this "Bulk Import" requirement which implies flat data -> relational structure:
    
    // Strategy: Insert Words first, get IDs? No, createMany doesn't return IDs in MySQL/Prisma.
    // Alternative: Use $transaction with create for each word (slower but correct for relations)
    // OR: Insert Words -> Fetch Words -> Insert Meanings.
    // Given the requirement "3000 words < 30s", simple loop with $transaction might be slow.
    // However, 3000 simple inserts is usually fine. Let's try optimized parallel promises in chunks.

    const chunkSize = 50; // Process in chunks to avoid blocking
    let successCount = 0;

    // We will use a loop with create for now to support the relations properly
    // To optimize, we can use Promise.all with concurrency limit
    
    for (let i = 0; i < newWordsToInsert.length; i += chunkSize) {
      const chunk = newWordsToInsert.slice(i, i + chunkSize);
      
      await prisma.$transaction(
        chunk.map(w => 
          prisma.word.create({
            data: {
              word: w.word,
              phonetic: w.phonetic,
              partOfSpeech: w.partOfSpeech,
              level: w.level,
              userId: auth.userId,
              meanings: {
                create: {
                  definition: w.meaning,
                  language: 'zh'
                }
              },
              // If example exists
              ...(w.example_en ? {
                examples: {
                  create: {
                    sentence: w.example_en,
                    translation: w.example_cn
                  }
                }
              } : {})
            }
          })
        )
      );
      successCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      total: rawData.length,
      imported: successCount,
      duplicates: duplicatesCount,
      failed: errors.length,
      errors: errors.slice(0, 100) // Limit error size
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed: ' + error.message }, { status: 500 });
  }
}
