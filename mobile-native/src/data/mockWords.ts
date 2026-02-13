export type WordLevel = '专升本' | 'CET4' | 'CET6' | 'IELTS';

export interface Word {
  id: string;
  word: string;
  phonetic_uk: string;
  phonetic_us: string;
  part_of_speech: string;
  meaning: string;
  level: WordLevel;
  tags: string[]; // e.g., 'noun', 'verb', 'difficult'
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
}

export const mockWords: Word[] = [
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
    tags: ['verb', 'negative'],
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
    tags: ['noun'],
    examples: [
      { en: 'She has the ability to pass the exam.', cn: '她有能力通过考试。' },
      { en: 'He is a man of great ability.', cn: '他是一个非常有才能的人。' },
      { en: 'The system has the ability to run on multiple platforms.', cn: '该系统能够在多个平台上运行。' }
    ],
    synonyms: ['capability', 'capacity', 'skill'],
    antonyms: ['inability'],
    roots: 'able (capable) + -ity (noun suffix)'
  },
  
  // CET4
  {
    id: '3',
    word: 'campus',
    phonetic_uk: '/ˈkæmpəs/',
    phonetic_us: '/ˈkæmpəs/',
    part_of_speech: 'n.',
    meaning: '校园，校区',
    level: 'CET4',
    tags: ['noun', 'school'],
    examples: [
      { en: 'I live on campus.', cn: '我住在校内。' },
      { en: 'The university has a beautiful campus.', cn: '这所大学有一个美丽的校园。' },
      { en: 'Campus life is exciting.', cn: '校园生活很精彩。' }
    ],
    synonyms: ['grounds', 'university'],
    antonyms: [],
    roots: 'camp (field) -> 场地 -> 校园'
  },
  {
    id: '4',
    word: 'decade',
    phonetic_uk: '/ˈdekeɪd/',
    phonetic_us: '/ˈdekeɪd/',
    part_of_speech: 'n.',
    meaning: '十年，十年期',
    level: 'CET4',
    tags: ['noun', 'time'],
    examples: [
      { en: 'Prices have risen steadily over the last decade.', cn: '过去十年物价稳步上涨。' },
      { en: 'He has worked here for a decade.', cn: '他在这里工作了十年。' },
      { en: 'The 1960s was a decade of change.', cn: '20世纪60年代是变革的十年。' }
    ],
    synonyms: [],
    antonyms: [],
    roots: 'deca (ten) -> 十'
  },

  // CET6
  {
    id: '5',
    word: 'abnormal',
    phonetic_uk: '/æbˈnɔːml/',
    phonetic_us: '/æbˈnɔːrml/',
    part_of_speech: 'adj.',
    meaning: '反常的，异常的',
    level: 'CET6',
    tags: ['adjective'],
    examples: [
      { en: 'It is abnormal for the temperature to be this high in winter.', cn: '冬天温度这么高是不正常的。' },
      { en: 'They found abnormal cells in the sample.', cn: '他们在样本中发现了异常细胞。' },
      { en: 'His behavior was considered abnormal.', cn: '他的行为被认为是反常的。' }
    ],
    synonyms: ['unusual', 'irregular', 'anomalous'],
    antonyms: ['normal', 'typical'],
    roots: 'ab- (away) + normal (rule) -> 偏离规则 -> 异常'
  },
  {
    id: '6',
    word: 'bulletin',
    phonetic_uk: '/ˈbʊlətɪn/',
    phonetic_us: '/ˈbʊlətɪn/',
    part_of_speech: 'n.',
    meaning: '公告，公报；新闻简报',
    level: 'CET6',
    tags: ['noun', 'media'],
    examples: [
      { en: 'Here is the latest news bulletin.', cn: '这是最新的新闻简报。' },
      { en: 'The company issued a bulletin to all employees.', cn: '公司向所有员工发布了公告。' },
      { en: 'A medical bulletin on the President’s health.', cn: '关于总统健康的医疗公报。' }
    ],
    synonyms: ['report', 'announcement', 'statement'],
    antonyms: [],
    roots: 'bulla (seal) -> 公文 -> 公告'
  },

  // IELTS
  {
    id: '7',
    word: 'accommodate',
    phonetic_uk: '/əˈkɒmədeɪt/',
    phonetic_us: '/əˈkɑːmədeɪt/',
    part_of_speech: 'v.',
    meaning: '容纳；向…提供住处；适应',
    level: 'IELTS',
    tags: ['verb'],
    examples: [
      { en: 'The hotel can accommodate up to 500 guests.', cn: '这家酒店最多可容纳500位客人。' },
      { en: 'We need to accommodate the needs of all students.', cn: '我们需要适应所有学生的需求。' },
      { en: 'He bought a huge house to accommodate his library.', cn: '他买了一栋大房子来安放他的藏书。' }
    ],
    synonyms: ['house', 'fit', 'adapt'],
    antonyms: ['reject'],
    roots: 'ad- (to) + commodus (suitable) -> 使适合 -> 容纳'
  },
  {
    id: '8',
    word: 'cohere',
    phonetic_uk: '/kəʊˈhɪə(r)/',
    phonetic_us: '/kəʊˈhɪr/',
    part_of_speech: 'v.',
    meaning: '连贯；一致；粘合',
    level: 'IELTS',
    tags: ['verb', 'abstract'],
    examples: [
      { en: 'The various parts of the theory do not cohere.', cn: '该理论的各个部分不连贯。' },
      { en: 'This view does not cohere with their other beliefs.', cn: '这一观点与他们的其他信仰不一致。' },
      { en: 'The particles cohere to form a solid mass.', cn: '微粒粘合形成固体块。' }
    ],
    synonyms: ['stick together', 'unite', 'bind'],
    antonyms: ['separate', 'fall apart'],
    roots: 'co- (together) + haerere (stick) -> 粘在一起'
  }
];
