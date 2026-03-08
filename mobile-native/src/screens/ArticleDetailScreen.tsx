import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';
import { WordStorage } from '../utils/storage';
import { Word, WordLevel } from '../data/mockWords';

const { width, height } = Dimensions.get('window');

// 单词词典数据
const wordDictionary: Record<string, {
  phonetic: string;
  meaning: string;
  example: string;
  translation: string;
  level: 'CET4' | 'CET6' | 'GRE' | 'TOEFL' | 'IELTS' | '常用';
}> = {
  'morning': {
    phonetic: '/ˈmɔːrnɪŋ/',
    meaning: '早晨，上午',
    example: 'I prefer to study in the morning.',
    translation: '我喜欢在早晨学习。',
    level: '常用',
  },
  'routine': {
    phonetic: '/ruːˈtiːn/',
    meaning: '常规，例行公事',
    example: 'Exercise is part of my daily routine.',
    translation: '锻炼是我日常例行公事的一部分。',
    level: 'CET4',
  },
  'successful': {
    phonetic: '/səkˈsesfl/',
    meaning: '成功的',
    example: 'She is a successful businesswoman.',
    translation: '她是一位成功的女商人。',
    level: 'CET4',
  },
  'achievements': {
    phonetic: '/əˈtʃiːvmənts/',
    meaning: '成就，成绩',
    example: 'His achievements in science are remarkable.',
    translation: '他在科学方面的成就是非凡的。',
    level: 'CET6',
  },
  'consistent': {
    phonetic: '/kənˈsɪstənt/',
    meaning: '一致的，持续的',
    example: 'Consistent effort leads to success.',
    translation: '持续的努力带来成功。',
    level: 'CET6',
  },
  'exercise': {
    phonetic: '/ˈeksərsaɪz/',
    meaning: '锻炼，练习',
    example: 'Regular exercise is good for health.',
    translation: '定期锻炼有益健康。',
    level: 'CET4',
  },
  'energy': {
    phonetic: '/ˈenərdʒi/',
    meaning: '能量，精力',
    example: 'I have more energy after working out.',
    translation: '锻炼后我精力更充沛了。',
    level: 'CET4',
  },
  'focus': {
    phonetic: '/ˈfoʊkəs/',
    meaning: '专注，集中',
    example: 'I need to focus on my work.',
    translation: '我需要专注于我的工作。',
    level: 'CET4',
  },
  'climate': {
    phonetic: '/ˈklaɪmət/',
    meaning: '气候',
    example: 'The climate is changing rapidly.',
    translation: '气候正在迅速变化。',
    level: 'CET4',
  },
  'environment': {
    phonetic: '/ɪnˈvaɪrənmənt/',
    meaning: '环境',
    example: 'We must protect the environment.',
    translation: '我们必须保护环境。',
    level: 'CET4',
  },
  'technology': {
    phonetic: '/tekˈnɑːlədʒi/',
    meaning: '技术',
    example: 'Technology is changing our lives.',
    translation: '技术正在改变我们的生活。',
    level: 'CET4',
  },
  'artificial': {
    phonetic: '/ˌɑːrtɪˈfɪʃl/',
    meaning: '人工的，人造的',
    example: 'Artificial intelligence is developing fast.',
    translation: '人工智能发展迅速。',
    level: 'CET6',
  },
  'intelligence': {
    phonetic: '/ɪnˈtelɪdʒəns/',
    meaning: '智力，智能',
    example: 'He has high intelligence.',
    translation: '他有很高的智力。',
    level: 'CET6',
  },
  'storytelling': {
    phonetic: '/ˈstɔːritelɪŋ/',
    meaning: '讲故事',
    example: 'Storytelling is an ancient art.',
    translation: '讲故事是一门古老的艺术。',
    level: '常用',
  },
  'minimalism': {
    phonetic: '/ˈmɪnɪməlɪzəm/',
    meaning: '极简主义',
    example: 'Minimalism helps simplify life.',
    translation: '极简主义有助于简化生活。',
    level: '常用',
  },
};

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  readTime: number;
  wordCount: number;
  imageColor: string;
}

// 模拟文章详情数据
const mockArticleDetails: Record<string, Article & { content: string; translation: string }> = {
  '1': {
    id: '1',
    title: 'The Power of Morning Routines',
    category: '生活方式',
    difficulty: 'easy',
    readTime: 5,
    wordCount: 450,
    imageColor: palette.secondary,
    content: `Many successful people attribute their achievements to consistent morning routines. The way you start your day often sets the tone for everything that follows.

A good morning routine doesn't have to be complicated. It could be as simple as waking up at the same time every day, drinking a glass of water, and spending a few minutes in quiet reflection.

Exercise is another common element in successful morning routines. Whether it's a full workout, a yoga session, or a simple walk, moving your body in the morning can boost your energy and focus.

Planning your day is also crucial. Take a few minutes to review your goals and prioritize your tasks. This helps you stay focused on what really matters.

Remember, the best morning routine is one that works for you. Experiment with different activities and find what makes you feel energized and ready to tackle the day.`,
    translation: `许多成功人士将他们的成就归功于一致的早晨习惯。你开始一天的方式往往为接下来的一切设定了基调。

一个好的早晨习惯不必很复杂。它可以很简单，比如每天在同一时间起床，喝一杯水，花几分钟安静反思。

锻炼是成功早晨习惯中的另一个常见元素。无论是完整的锻炼、瑜伽课程还是简单的散步，早上活动身体可以提升你的精力和专注力。

规划你的一天也很关键。花几分钟回顾你的目标并确定任务的优先级。这有助于你专注于真正重要的事情。

记住，最好的早晨习惯是适合你的习惯。尝试不同的活动，找到让你感到精力充沛并准备好迎接一天的事情。`,
  },
  '2': {
    id: '2',
    title: 'Understanding Climate Change',
    category: '科学',
    difficulty: 'medium',
    readTime: 8,
    wordCount: 720,
    imageColor: palette.grass,
    content: `Climate change refers to long-term shifts in temperatures and weather patterns. These shifts may be natural, but since the 1800s, human activities have been the main driver of climate change.

The primary cause is the burning of fossil fuels like coal, oil, and gas. When burned, these fuels release greenhouse gases that trap heat in the atmosphere, causing the planet to warm.

The effects of climate change are already visible. We're seeing rising sea levels, more extreme weather events, and changes in wildlife populations. Glaciers are melting, and Arctic sea ice is declining.

But it's not too late to take action. Reducing our carbon footprint, transitioning to renewable energy, and protecting forests can all help slow down climate change. Every small action counts.

Understanding climate change is the first step toward making a difference. By educating ourselves and others, we can work together to protect our planet for future generations.`,
    translation: `气候变化指的是温度和天气模式的长期转变。这些转变可能是自然发生的，但自19世纪以来，人类活动一直是气候变化的主要驱动力。

主要原因是燃烧煤炭、石油和天然气等化石燃料。当这些燃料被燃烧时，会释放温室气体，将热量困在大气中，导致地球变暖。

气候变化的影响已经可见。我们看到海平面上升、更极端的天气事件以及野生动物种群的变化。冰川正在融化，北极海冰正在减少。

但现在采取行动还为时不晚。减少我们的碳足迹、转向可再生能源以及保护森林都可以帮助减缓气候变化。每一个小行动都很重要。

理解气候变化是做出改变的第一步。通过教育自己和他人，我们可以共同努力，为后代保护我们的星球。`,
  },
  '3': {
    id: '3',
    title: 'The Art of Storytelling',
    category: '文学',
    difficulty: 'medium',
    readTime: 6,
    wordCount: 580,
    imageColor: palette.accent,
    content: `Storytelling is an ancient art that has captivated human beings for thousands of years. From cave paintings to modern films, stories help us make sense of the world and connect with one another.

A compelling story typically has several key elements. First, there's the protagonist – a character the audience can root for. Then there's conflict, the challenge that drives the story forward.

Setting is also crucial. Whether it's a fantasy world or a small town, the environment shapes the story and influences the characters' decisions.

But perhaps most importantly, good stories evoke emotion. They make us laugh, cry, or sit on the edge of our seats. This emotional connection is what makes stories memorable.

Whether you're writing a novel, giving a presentation, or just sharing an anecdote with friends, understanding the art of storytelling can help you communicate more effectively.`,
    translation: `讲故事是一门古老的艺术，几千年来一直吸引着人类。从洞穴壁画到现代电影，故事帮助我们理解世界并相互联系。

一个引人入胜的故事通常有几个关键要素。首先，有主角——观众可以支持的角色。然后是冲突，推动故事向前发展的挑战。

背景也很关键。无论是幻想世界还是小镇，环境塑造故事并影响角色的决定。

但也许最重要的是，好的故事能唤起情感。它们让我们欢笑、哭泣，或坐在座位边缘。这种情感联系是故事令人难忘的原因。

无论你是在写小说、做演讲，还是只是与朋友分享轶事，理解讲故事的艺术都可以帮助你更有效地沟通。`,
  },
  '4': {
    id: '4',
    title: 'Artificial Intelligence in Healthcare',
    category: '科技',
    difficulty: 'hard',
    readTime: 10,
    wordCount: 950,
    imageColor: palette.primary,
    content: `Artificial intelligence is revolutionizing healthcare in ways that were once the stuff of science fiction. From diagnosing diseases to developing new treatments, AI is transforming how we approach medicine.

One of the most promising applications is in medical imaging. AI algorithms can analyze X-rays, MRIs, and CT scans with remarkable accuracy, often detecting abnormalities that human eyes might miss. This can lead to earlier diagnoses and better outcomes for patients.

Drug discovery is another area where AI is making a significant impact. Traditional drug development is time-consuming and expensive, often taking over a decade and billions of dollars. AI can help researchers identify promising compounds much faster, potentially bringing life-saving medications to market sooner.

AI is also being used to personalize treatment plans. By analyzing a patient's genetic information, medical history, and lifestyle factors, AI systems can recommend treatments that are most likely to be effective for that specific individual.

However, challenges remain. Questions about privacy, ethics, and the need for human oversight must be addressed as AI becomes more integrated into healthcare.`,
    translation: `人工智能正在以曾经是科幻小说情节的方式彻底改变医疗保健。从诊断疾病到开发新疗法，人工智能正在改变我们处理医学的方式。

最有前景的应用之一是在医学影像方面。人工智能算法可以以惊人的准确性分析X光片、MRI和CT扫描，通常能检测到人眼可能遗漏的异常。这可以带来更早的诊断和更好的患者预后。

药物发现是另一个人工智能产生重大影响的领域。传统的药物开发既耗时又昂贵，通常需要超过十年和数十亿美元。人工智能可以帮助研究人员更快地识别有前景的化合物，可能更快地将救命药物推向市场。

人工智能还被用于个性化治疗方案。通过分析患者的遗传信息、病史和生活方式因素，人工智能系统可以推荐最有可能对特定个体有效的治疗。

然而，挑战仍然存在。随着人工智能越来越多地融入医疗保健，必须解决有关隐私、伦理和人类监督需求的问题。`,
  },
  '5': {
    id: '5',
    title: 'Minimalist Living Guide',
    category: '生活方式',
    difficulty: 'easy',
    readTime: 4,
    wordCount: 380,
    imageColor: palette.vipGold,
    content: `Minimalism is more than just decluttering your home – it's a lifestyle choice that focuses on what truly matters. By eliminating excess, we create space for the things that bring us joy and fulfillment.

The journey to minimalism often starts with physical possessions. Go through your belongings and ask yourself: Does this item serve a purpose? Does it bring me happiness? If the answer is no to both, it might be time to let it go.

But minimalism extends beyond material things. It's also about simplifying your schedule, your digital life, and your relationships. Focus on quality over quantity in every aspect of your life.

The benefits of minimalism are numerous. With fewer possessions, there's less to clean, maintain, and worry about. Many minimalists report feeling less stressed and more content with their lives.

Remember, minimalism looks different for everyone. The goal isn't to own as little as possible, but to make room for what truly matters to you.`,
    translation: `极简主义不仅仅是整理你的家——它是一种生活方式选择，专注于真正重要的事情。通过消除多余的东西，我们为那些带给我们快乐和满足感的事物创造了空间。

极简主义的旅程通常从物质财产开始。仔细检查你的物品，问自己：这件物品有用途吗？它给我带来快乐吗？如果两个答案都是否定的，可能是时候放手了。

但极简主义超越了物质事物。它还包括简化你的日程安排、数字生活和人际关系。在生活的每个方面都要注重质量而不是数量。

极简主义的好处众多。拥有更少的财产，就有更少的东西需要清洁、维护和担心。许多极简主义者报告说，他们感到压力更小，对生活更满意。

记住，极简主义对每个人来说看起来都不同。目标不是拥有尽可能少的东西，而是为真正对你重要的事情腾出空间。`,
  },
};

// 单词卡片组件
function WordCard({
  word,
  visible,
  onClose,
}: {
  word: string;
  visible: boolean;
  onClose: () => void;
}) {
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const wordData = wordDictionary[word.toLowerCase()];

  const playWordAudio = () => {
    Speech.stop();
    Speech.speak(word, {
      language: 'en-US',
      rate: 0.7,
      pitch: 1.0,
    });
  };

  const handleAddToWordBook = async () => {
    if (!wordData) return;

    const newWord: Word = {
      id: Date.now().toString(),
      word: word,
      phonetic_uk: wordData.phonetic,
      phonetic_us: wordData.phonetic,
      part_of_speech: 'unknown', // Default
      meaning: wordData.meaning,
      level: wordData.level as WordLevel,
      tags: [],
      examples: [
        {
          en: wordData.example,
          cn: wordData.translation,
        },
      ],
      synonyms: [],
      antonyms: [],
      roots: '',
      isMastered: false,
    };

    const success = await WordStorage.addWord(newWord);
    if (success) {
      Alert.alert('成功', '已添加到单词本');
    } else {
      Alert.alert('提示', '单词本中已存在该单词');
    }
  };

  if (!wordData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <Animated.View
          style={[
            styles.wordCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* 单词头部 */}
          <View style={styles.wordCardHeader}>
            <View>
              <Text style={styles.wordCardWord}>{word}</Text>
              <Text style={styles.wordCardPhonetic}>{wordData.phonetic}</Text>
            </View>
            <TouchableOpacity style={styles.wordCardAudio} onPress={playWordAudio}>
              <Ionicons name="volume-high" size={28} color={palette.primary} />
            </TouchableOpacity>
          </View>

          {/* 等级标签 */}
          <View style={[styles.levelTag, { backgroundColor: getLevelColor(wordData.level) + '20' }]}>
            <Text style={[styles.levelTagText, { color: getLevelColor(wordData.level) }]}>
              {wordData.level}
            </Text>
          </View>

          {/* 释义 */}
          <View style={styles.wordCardSection}>
            <Text style={styles.wordCardSectionTitle}>释义</Text>
            <Text style={styles.wordCardMeaning}>{wordData.meaning}</Text>
          </View>

          {/* 例句 */}
          <View style={styles.wordCardSection}>
            <Text style={styles.wordCardSectionTitle}>例句</Text>
            <Text style={styles.wordCardExample}>{wordData.example}</Text>
            <Text style={styles.wordCardExampleTranslation}>{wordData.translation}</Text>
          </View>

          {/* 按钮组 */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddToWordBook}>
              <LinearGradient
                colors={[palette.primary, palette.primaryLight]}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle-outline" size={20} color={palette.cloud} />
                <Text style={styles.addButtonText}>加入单词本</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.wordCardClose} onPress={onClose}>
              <Text style={styles.wordCardCloseText}>知道了</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'CET4': return '#4CAF50';
    case 'CET6': return '#2196F3';
    case 'GRE': return '#9C27B0';
    case 'TOEFL': return '#FF9800';
    case 'IELTS': return '#E91E63';
    default: return '#757575';
  }
}

// 可点击的单词组件
function ClickableWord({
  word,
  onPress,
}: {
  word: string;
  onPress: (word: string) => void;
}) {
  // 清理单词（去除标点符号）
  const cleanWord = word.replace(/[^a-zA-Z]/g, '');
  const hasDictionaryEntry = cleanWord && wordDictionary[cleanWord.toLowerCase()];

  if (!cleanWord || cleanWord.length < 3) {
    return <Text style={styles.normalText}>{word}</Text>;
  }

  return (
    <Text
      style={[styles.normalText, hasDictionaryEntry && styles.clickableWord]}
      onPress={() => hasDictionaryEntry && onPress(cleanWord)}
    >
      {word}
    </Text>
  );
}

// 渲染带有点击单词的文本
function renderClickableText(text: string, onWordPress: (word: string) => void) {
  // 分割文本：按空格和标点分割，但保留标点
  const parts = text.split(/(\s+|[.,!?;:"()\[\]{}])/);

  return parts.map((part, index) => {
    if (!part) return null;

    // 如果是空格或换行，直接渲染
    if (/^\s+$/.test(part)) {
      return <Text key={index}>{part}</Text>;
    }

    // 如果是标点符号，直接渲染
    if (/^[.,!?;:"()\[\]{}]+$/.test(part)) {
      return <Text key={index} style={styles.normalText}>{part}</Text>;
    }

    // 渲染可点击的单词
    return (
      <ClickableWord
        key={index}
        word={part}
        onPress={onWordPress}
      />
    );
  });
}

export default function ArticleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { articleId } = route.params as { articleId: string };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [showWordCard, setShowWordCard] = useState(false);
  const { updateReadingProgress } = useAppStore();

  const article = mockArticleDetails[articleId];

  useEffect(() => {
    updateReadingProgress(20);
    return () => {
      Speech.stop();
    };
  }, [articleId]);

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={palette.cloud} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>文章详情</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={60} color={palette.textLight} />
          <Text style={styles.errorText}>文章不存在</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleWordPress = useCallback((word: string) => {
    setSelectedWord(word);
    setShowWordCard(true);
  }, []);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'medium': return '中等';
      case 'hard': return '困难';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return palette.success;
      case 'medium': return palette.warning;
      case 'hard': return palette.error;
      default: return palette.textLight;
    }
  };

  const playAudio = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    Speech.speak(article.content, {
      language: 'en-US',
      rate: 0.8,
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // 将文章分段渲染
  const renderParagraphs = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => (
      <View key={index} style={styles.paragraph}>
        <Text style={styles.paragraphText}>
          {renderClickableText(paragraph, handleWordPress)}
        </Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 单词卡片弹窗 */}
      <WordCard
        word={selectedWord}
        visible={showWordCard}
        onClose={() => setShowWordCard(false)}
      />

      {/* 头部 */}
      <LinearGradient
        colors={[article.imageColor, article.imageColor + 'DD']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={palette.cloud} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.categoryTag}>{article.category}</Text>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.metaInfo}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(article.difficulty) + '30' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(article.difficulty) }]}>
                {getDifficultyLabel(article.difficulty)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={palette.cloud} />
              <Text style={styles.metaText}>{article.readTime}分钟</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="document-text-outline" size={14} color={palette.cloud} />
              <Text style={styles.metaText}>{article.wordCount}词</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* 工具栏 */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={playAudio}>
          <Ionicons name={isSpeaking ? "stop" : "volume-high"} size={22} color={palette.primary} />
          <Text style={styles.toolbarButtonText}>{isSpeaking ? '停止' : '朗读'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarButton, showTranslation && styles.toolbarButtonActive]}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <Ionicons name="language" size={22} color={showTranslation ? palette.primary : palette.textSecondary} />
          <Text style={[styles.toolbarButtonText, showTranslation && styles.toolbarButtonTextActive]}>
            译文
          </Text>
        </TouchableOpacity>

        <View style={styles.toolbarHint}>
          <Ionicons name="information-circle-outline" size={16} color={palette.textLight} />
          <Text style={styles.toolbarHintText}>点击单词查看释义</Text>
        </View>
      </View>

      {/* 文章内容 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.articleContent}>
          {renderParagraphs(article.content)}
        </View>

        {showTranslation && (
          <View style={styles.translationContainer}>
            <View style={styles.translationHeader}>
              <Ionicons name="language" size={18} color={palette.primary} />
              <Text style={styles.translationTitle}>中文翻译</Text>
            </View>
            <Text style={styles.translationText}>{article.translation}</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerContent: {
    marginTop: spacing.sm,
  },
  categoryTag: {
    ...typography.caption,
    color: palette.cloud,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: palette.cloud,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  difficultyText: {
    ...typography.caption,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: palette.cloud,
    marginLeft: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    ...shadows.sm,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: palette.background,
  },
  toolbarButtonActive: {
    backgroundColor: palette.primary + '15',
  },
  toolbarButtonText: {
    ...typography.body2,
    color: palette.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  toolbarButtonTextActive: {
    color: palette.primary,
    fontWeight: '600',
  },
  toolbarHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  toolbarHintText: {
    ...typography.caption,
    color: palette.textLight,
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  articleContent: {
    padding: spacing.lg,
    backgroundColor: palette.surface,
  },
  paragraph: {
    marginBottom: spacing.md,
  },
  paragraphText: {
    ...typography.body1,
    color: palette.textPrimary,
    lineHeight: 28,
    flexWrap: 'wrap',
  },
  normalText: {
    ...typography.body1,
    color: palette.textPrimary,
    lineHeight: 28,
  },
  clickableWord: {
    color: palette.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: palette.primary + '50',
  },
  translationContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  translationTitle: {
    ...typography.body1,
    color: palette.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  translationText: {
    ...typography.body1,
    color: palette.textSecondary,
    lineHeight: 26,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body1,
    color: palette.textLight,
    marginTop: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
    color: palette.cloud,
  },
  // 单词卡片样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  wordCard: {
    backgroundColor: palette.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: width - spacing.lg * 2,
    maxHeight: height * 0.6,
    ...shadows.lg,
  },
  wordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  wordCardWord: {
    ...typography.h2,
    color: palette.textPrimary,
    fontWeight: '700',
  },
  wordCardPhonetic: {
    ...typography.body2,
    color: palette.textSecondary,
    marginTop: 4,
  },
  wordCardAudio: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  levelTagText: {
    ...typography.caption,
    fontWeight: '600',
  },
  wordCardSection: {
    marginBottom: spacing.md,
  },
  wordCardSectionTitle: {
    ...typography.body2,
    color: palette.textLight,
    marginBottom: spacing.xs,
  },
  wordCardMeaning: {
    ...typography.body1,
    color: palette.textPrimary,
    fontWeight: '600',
  },
  wordCardExample: {
    ...typography.body2,
    color: palette.textPrimary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  wordCardExampleTranslation: {
    ...typography.body2,
    color: palette.textSecondary,
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  addButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addButtonText: {
    ...typography.body1,
    color: palette.cloud,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  wordCardClose: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: palette.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  wordCardCloseText: {
    ...typography.body1,
    color: palette.textSecondary,
    fontWeight: '600',
  },
});
