import 'dotenv/config';
import { prisma } from '../src/lib/db';
import { faker } from '@faker-js/faker';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const SCENARIO_THEMES = [
  'Business Email', 'Academic Writing', 'Travel Emergency', 'Job Interview',
  'Medical English', 'Legal Basics', 'IT & Tech', 'Marketing',
  'Finance', 'Daily Conversation', 'Shopping', 'Restaurant',
  'Hotel & Accommodation', 'Transportation', 'Social Networking'
];

async function main() {
  console.log('Starting advanced vocabulary generation...');

  // 1. Fetch existing words to avoid duplicates
  const existingWords = await prisma.word.findMany({
    select: { word: true }
  });
  const existingWordSet = new Set(existingWords.map(w => w.word.toLowerCase()));

  // 2. Generate 1000+ Core Words
  const newWords = [];
  const TARGET_COUNT = 1050; // Aim for slightly more to cover collisions
  let generatedCount = 0;

  console.log(`Generating ${TARGET_COUNT} new words...`);

  while (generatedCount < TARGET_COUNT) {
    const word = faker.word.noun(); // simplistic, but works for mock
    if (!existingWordSet.has(word.toLowerCase())) {
      const level = faker.helpers.arrayElement(CEFR_LEVELS);
      
      newWords.push({
        word: word,
        phoneticUk: `/${word}/`,
        phoneticUs: `/${word}/`,
        audioUk: `https://dict.youdao.com/dictvoice?audio=${word}&type=1`,
        audioUs: `https://dict.youdao.com/dictvoice?audio=${word}&type=2`,
        partOfSpeech: faker.helpers.arrayElement(['n.', 'v.', 'adj.', 'adv.']),
        level: level,
        cefrLevel: level,
        rootAffix: JSON.stringify({ root: word.substring(0, 3), meaning: "basic unit" }),
        mnemonicImg: `https://picsum.photos/seed/${word}/200`,
        collocations: JSON.stringify([
          `${faker.word.verb()} ${word}`,
          `${word} ${faker.word.noun()}`
        ]),
        userId: null, // System word
        // Randomly assign exam flags based on level
        upgrade_flag: ['A2', 'B1'].includes(level) ? 1 : 0,
        cet4_flag: ['B1', 'B2'].includes(level) ? 1 : 0,
        cet6_flag: ['B2', 'C1'].includes(level) ? 1 : 0,
        ielts_flag: ['C1', 'C2'].includes(level) ? 1 : 0,
      });
      existingWordSet.add(word.toLowerCase());
      generatedCount++;
    }
  }

  // Batch insert words
  // Prisma createMany doesn't support nested relations (Meanings/Examples) easily in one go for MySQL unless we separate them.
  // But wait, createMany is fine for the Word table itself. We need IDs to link Meanings.
  // So we might need to insert one by one or in small batches if we want Meanings.
  // For performance (1.2s requirement is for READ, but WRITE should also be reasonable), 
  // let's try to insert Words first, then get their IDs? 
  // Or just use a loop with Promise.all for reasonable batches.

  console.log('Inserting words into database...');
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < newWords.length; i += BATCH_SIZE) {
    const batch = newWords.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (w) => {
      const created = await prisma.word.create({
        data: {
          ...w,
          meanings: {
            create: [
              { definition: faker.lorem.sentence(), language: 'en' },
              { definition: '中文释义: ' + faker.word.adjective(), language: 'zh' }
            ]
          },
          examples: {
            create: [
              { sentence: faker.lorem.sentence(), translation: '例句翻译...' },
              { sentence: faker.lorem.sentence(), translation: '例句翻译...' }
            ]
          }
        }
      });
      return created;
    });
    await Promise.all(promises);
    process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, newWords.length)}/${newWords.length}`);
  }
  console.log('\nWords insertion complete.');

  // 3. Generate Scenario Packs
  console.log('Generating Scenario Packs...');
  
  for (const theme of SCENARIO_THEMES) {
    // Create Pack
    const pack = await prisma.scenarioPack.create({
      data: {
        title: theme,
        category: 'General',
        description: `Essential vocabulary for ${theme}`,
        level: 'Intermediate',
        coverImg: `https://picsum.photos/seed/${theme}/300/200`
      }
    });

    // Find 30 random words to link
    // In a real app, these would be semantically related. Here we pick random from DB.
    const randomWords = await prisma.word.findMany({
      take: 30,
      skip: Math.floor(Math.random() * 100), // Random offset
    });

    // Link words to pack (Implicit M-N in schema: words Word[])
    // Wait, I defined it as `words Word[]` in ScenarioPack and `scenarioPacks ScenarioPack[]` in Word.
    // Prisma handles the join table `_ScenarioPackToWord` automatically.
    
    await prisma.scenarioPack.update({
      where: { id: pack.id },
      data: {
        words: {
          connect: randomWords.map(w => ({ id: w.id }))
        }
      }
    });
    console.log(`Created pack: ${theme}`);
  }

  console.log('All done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
