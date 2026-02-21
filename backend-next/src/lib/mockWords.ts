export type WordLevel = '专升本' | 'CET4' | 'CET6' | 'IELTS';

export interface Word {
  id: string;
  word: string;
  phonetic_uk: string;
  phonetic_us: string;
  part_of_speech: string;
  meaning: string;
  level: WordLevel;
  tags: string[]; 
  examples: { en: string; cn: string }[];
  synonyms: string[];
  antonyms: string[];
  roots: string;
  // Learning status
  isFavorite?: boolean;
  isMastered?: boolean;
  notes?: string;
  // Exam Flags
  upgrade_flag?: number;
  cet4_flag?: number;
  cet6_flag?: number;
  ielts_flag?: number;
  // Frequency
  frequency?: number;
  exam_frequency?: number;
}

const realWords: Word[] = [
  // 专升本
  {
    id: '1',
    word: 'abandon',
    phonetic_uk: '/əˈbændən/',
    phonetic_us: '/əˈbændən/',
    part_of_speech: 'v.',
    meaning: '放弃，抛弃；遗弃',
    level: '专升本',
    upgrade_flag: 1,
    cet4_flag: 1,
    cet6_flag: 0,
    ielts_flag: 0,
    frequency: 98,
    exam_frequency: 15,
    tags: ['verb', 'negative', 'high-frequency'],
    examples: [
      { en: 'He claimed that his parents had abandoned him.', cn: '他声称父母遗弃了他。' },
      { en: 'They had to abandon the car.', cn: '他们不得不弃车而去。' },
      { en: 'We had to abandon the plan.', cn: '我们不得不放弃这个计划。' }
    ],
    synonyms: ['discard', 'give up', 'leave'],
    antonyms: ['keep', 'retain'],
    roots: 'a- (not) + ban (proclaim) -> 放弃宣告 -> 放弃'
  },
  {
    id: '2',
    word: 'ability',
    phonetic_uk: '/əˈbɪləti/',
    phonetic_us: '/əˈbɪləti/',
    part_of_speech: 'n.',
    meaning: '能力；本领；才能',
    level: '专升本',
    upgrade_flag: 1,
    cet4_flag: 1,
    cet6_flag: 0,
    ielts_flag: 0,
    frequency: 95,
    exam_frequency: 12,
    tags: ['noun', 'basic'],
    examples: [
      { en: 'She has the ability to pass the exam.', cn: '她有能力通过考试。' },
      { en: 'He is a man of great ability.', cn: '他是一个非常有才能的人。' },
      { en: 'The system has the ability to run on multiple platforms.', cn: '该系统能够在多个平台上运行。' }
    ],
    synonyms: ['capability', 'capacity', 'skill'],
    antonyms: ['inability'],
    roots: 'able (capable) + -ity (noun suffix)'
  },
  {
    id: '3',
    word: 'absolute',
    phonetic_uk: '/ˈæbsəluːt/',
    phonetic_us: '/ˈæbsəluːt/',
    part_of_speech: 'adj.',
    meaning: '绝对的；完全的',
    level: '专升本',
    upgrade_flag: 1,
    cet4_flag: 1,
    cet6_flag: 0,
    ielts_flag: 0,
    frequency: 88,
    exam_frequency: 8,
    tags: ['adjective'],
    examples: [
      { en: 'I have absolute confidence in her.', cn: '我对她有绝对的信心。' },
      { en: 'There is no absolute standard for beauty.', cn: '美没有绝对的标准。' }
    ],
    synonyms: ['complete', 'total', 'perfect'],
    antonyms: ['relative'],
    roots: 'ab- (away) + solvere (loosen) -> 没有任何束缚 -> 绝对的'
  },
  {
    id: '4',
    word: 'academic',
    phonetic_uk: '/ˌækəˈdemɪk/',
    phonetic_us: '/ˌækəˈdemɪk/',
    part_of_speech: 'adj.',
    meaning: '学术的；学院的；理论的',
    level: '专升本',
    upgrade_flag: 1,
    cet4_flag: 1,
    cet6_flag: 1,
    ielts_flag: 1,
    frequency: 92,
    exam_frequency: 20,
    tags: ['adjective', 'education'],
    examples: [
      { en: 'The university has a high academic reputation.', cn: '这所大学有很高的学术声誉。' },
      { en: 'The question is purely academic.', cn: '这个问题纯粹是理论上的。' }
    ],
    synonyms: ['scholarly', 'educational'],
    antonyms: ['practical'],
    roots: 'academy (school) + -ic'
  },
  // ... (Assuming more words imported)
];

// Generate more dummy words to simulate "all" vocabulary
const generateDummyWords = (): Word[] => {
  const dummyWords: Word[] = [];
  const levels: WordLevel[] = ['专升本', 'CET4', 'CET6', 'IELTS'];
  
  for (let i = 5; i <= 3500; i++) {
    const level = '专升本'; // Focus on Zhuan Sheng Ben
    dummyWords.push({
      id: i.toString(),
      word: `word_${i}`,
      phonetic_uk: `/wɜːd_${i}/`,
      phonetic_us: `/wɜːrd_${i}/`,
      part_of_speech: i % 2 === 0 ? 'n.' : 'v.',
      meaning: `This is the meaning of word_${i}. It is a dummy word for testing.`,
      level: level,
      upgrade_flag: 1,
      frequency: Math.floor(Math.random() * 100),
      exam_frequency: Math.floor(Math.random() * 10),
      tags: ['test', level.toLowerCase()],
      examples: [
        { en: `Example sentence for word_${i}.`, cn: `单词_${i}的例句。` }
      ],
      synonyms: [],
      antonyms: [],
      roots: `root_${i}`
    });
  }
  return dummyWords;
};

export const mockWords: Word[] = [...realWords, ...generateDummyWords()];
