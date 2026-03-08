import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { getChapterById, getNextChapter, getPrevChapter, chapters } from '../data/littlePrince';

const { width, height } = Dimensions.get('window');

// 《小王子》专用词汇表
const princeVocabulary: Record<string, {
  phonetic: string;
  meaning: string;
  example: string;
  translation: string;
  level: string;
}> = {
  'prince': { phonetic: '/prɪns/', meaning: '王子', example: 'The little prince lived on asteroid B-612.', translation: '小王子住在B-612号小行星上。', level: '常用' },
  'sheep': { phonetic: '/ʃiːp/', meaning: '绵羊', example: 'Draw me a sheep!', translation: '给我画一只绵羊！', level: 'CET4' },
  'baobab': { phonetic: '/ˈbeɪoʊbæb/', meaning: '猴面包树', example: 'Baobabs must be pulled up regularly.', translation: '猴面包树必须定期拔掉。', level: '常用' },
  'asteroid': { phonetic: '/ˈæstərɔɪd/', meaning: '小行星', example: 'His planet was hardly bigger than a house.', translation: '他的星球几乎不比一所房子大。', level: 'CET6' },
  'planet': { phonetic: '/ˈplænɪt/', meaning: '行星', example: 'The little prince came from another planet.', translation: '小王子来自另一个星球。', level: 'CET4' },
  'sunset': { phonetic: '/ˈsʌnset/', meaning: '日落', example: 'I watched the sunset forty-four times.', translation: '我看了四十四次日落。', level: 'CET4' },
  'tame': { phonetic: '/teɪm/', meaning: '驯养', example: 'You must be patient to tame someone.', translation: '驯养一个人必须要有耐心。', level: 'CET6' },
  'essential': { phonetic: '/ɪˈsenʃl/', meaning: '本质的', example: 'What is essential is invisible to the eyes.', translation: '真正重要的东西用眼睛是看不见的。', level: 'CET4' },
  'invisible': { phonetic: '/ɪnˈvɪzəbl/', meaning: '看不见的', example: 'The most beautiful things are invisible.', translation: '最美好的东西是看不见的。', level: 'CET6' },
  'responsible': { phonetic: '/rɪˈspɑːnsəbl/', meaning: '负责的', example: 'You become responsible for what you tame.', translation: '你要对你驯养的东西负责。', level: 'CET4' },
  'forever': { phonetic: '/fərˈevər/', meaning: '永远', example: 'The little prince will love his rose forever.', translation: '小王子会永远爱他的玫瑰。', level: 'CET4' },
  'lonely': { phonetic: '/ˈloʊnli/', meaning: '孤独的', example: 'The king lived alone and felt lonely.', translation: '国王独自生活，感到孤独。', level: 'CET4' },
  'precious': { phonetic: '/ˈpreʃəs/', meaning: '珍贵的', example: 'Time makes your rose precious.', translation: '时间使你的玫瑰变得珍贵。', level: 'CET6' },
  'boa': { phonetic: '/ˈboʊə/', meaning: '蟒蛇', example: 'Boa constrictors swallow their prey whole.', translation: '蟒蛇把猎物整个吞下。', level: 'GRE' },
  'constrictor': { phonetic: '/kənˈstrɪktər/', meaning: '大蟒', example: 'The boa constrictor is very dangerous.', translation: '大蟒蛇非常危险。', level: 'GRE' },
  'pilot': { phonetic: '/ˈpaɪlət/', meaning: '飞行员', example: 'I learned to pilot airplanes.', translation: '我学会了驾驶飞机。', level: 'CET4' },
  'desert': { phonetic: '/ˈdezərt/', meaning: '沙漠', example: 'I crashed in the Desert of Sahara.', translation: '我在撒哈拉沙漠坠机了。', level: 'CET4' },
  'airplane': { phonetic: '/ˈerpleɪn/', meaning: '飞机', example: 'My airplane broke down.', translation: '我的飞机坏了。', level: '常用' },
  'grown-up': { phonetic: '/ˈɡroʊn ʌp/', meaning: '大人', example: 'Grown-ups never understand.', translation: '大人们从不理解。', level: '常用' },
  'drawing': { phonetic: '/ˈdrɔːɪŋ/', meaning: '绘画', example: 'I gave up my career as a painter.', translation: '我放弃了画家生涯。', level: 'CET4' },
  'engine': { phonetic: '/ˈendʒɪn/', meaning: '发动机', example: 'Something broke in my engine.', translation: '我的发动机某个部件坏了。', level: 'CET4' },
  'thunderstruck': { phonetic: '/ˈθʌndərstrʌk/', meaning: '震惊的', example: 'I jumped to my feet, thunderstruck.', translation: '我跳了起来，完全被震惊了。', level: 'GRE' },
  'apparition': { phonetic: '/ˌæpəˈrɪʃn/', meaning: '幻影', example: 'I stared at this sudden apparition.', translation: '我盯着这个突然出现的幻影。', level: 'GRE' },
  'impenetrable': { phonetic: '/ɪmˈpenɪtrəbl/', meaning: '难以理解的', example: 'The mystery of his presence was impenetrable.', translation: '他存在的谜团难以穿透。', level: 'GRE' },
  'contemplation': { phonetic: '/ˌkɑːntəmˈpleɪʃn/', meaning: '沉思', example: 'He buried himself in contemplation.', translation: '他埋头沉思。', level: 'CET6' },
  'intervention': { phonetic: '/ˌɪntərˈvenʃn/', meaning: '干预', example: 'Without timely intervention, disaster strikes.', translation: '没有及时的干预，灾难就会降临。', level: 'CET6' },
  'catastrophe': { phonetic: '/kəˈtæstrəfi/', meaning: '灾难', example: 'With baobabs, delay means catastrophe.', translation: '对于猴面包树，拖延意味着灾难。', level: 'CET6' },
};

interface WordPopupProps {
  word: string;
  visible: boolean;
  onClose: () => void;
}

function WordPopup({ word, visible, onClose }: WordPopupProps) {
  const wordData = princeVocabulary[word.toLowerCase()];
  const [isPlaying, setIsPlaying] = useState(false);

  if (!wordData || !visible) return null;

  const playPronunciation = async () => {
    if (isPlaying) {
      await Speech.stop();
      setIsPlaying(false);
      return;
    }
    
    setIsPlaying(true);
    try {
      await Speech.speak(word, {
        language: 'en',
        pitch: 1.0,
        rate: 0.8,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupWord}>{word}</Text>
              <TouchableOpacity onPress={playPronunciation} style={styles.soundButton}>
                <Ionicons 
                  name={isPlaying ? "volume-high" : "volume-medium"} 
                  size={24} 
                  color={palette.primary} 
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.popupPhonetic}>{wordData.phonetic}</Text>
            
            <View style={styles.meaningBox}>
              <Text style={styles.popupMeaning}>{wordData.meaning}</Text>
              <View style={styles.levelTag}>
                <Text style={styles.levelText}>{wordData.level}</Text>
              </View>
            </View>
            
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>例句</Text>
              <Text style={styles.exampleText}>{wordData.example}</Text>
              <Text style={styles.exampleTranslation}>{wordData.translation}</Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const ChapterDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chapterId } = route.params as { chapterId: string };
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  const chapter = getChapterById(chapterId);
  const nextChapter = getNextChapter(chapterId);
  const prevChapter = getPrevChapter(chapterId);

  if (!chapter) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>章节不存在</Text>
      </SafeAreaView>
    );
  }

  const handleWordPress = (word: string) => {
    const cleanWord = word.replace(/[^a-zA-Z\-]/g, '').toLowerCase();
    if (cleanWord && princeVocabulary[cleanWord]) {
      setSelectedWord(cleanWord);
    }
  };

  const renderClickableText = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, pIndex) => {
      const words = paragraph.split(/(\s+)/);
      return (
        <Text key={pIndex} style={[styles.paragraph, { fontSize }]}>
          {words.map((word, wIndex) => {
            const cleanWord = word.replace(/[^a-zA-Z\-]/g, '').toLowerCase();
            const hasDefinition = princeVocabulary[cleanWord];
            
            if (hasDefinition) {
              return (
                <Text
                  key={wIndex}
                  style={styles.clickableWord}
                  onPress={() => handleWordPress(word)}
                >
                  {word}
                </Text>
              );
            }
            return <Text key={wIndex}>{word}</Text>;
          })}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部导航 */}
      <LinearGradient
        colors={[palette.accent, palette.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.chapterNumber}>第 {chapter.number} 章</Text>
            <Text style={styles.chapterName} numberOfLines={1}>{chapter.titleCn}</Text>
          </View>

          <TouchableOpacity 
            onPress={() => setShowTranslation(!showTranslation)} 
            style={styles.headerButton}
          >
            <Ionicons 
              name={showTranslation ? "language" : "language-outline"} 
              size={24} 
              color="#FFF" 
            />
          </TouchableOpacity>
        </View>

        {/* 进度指示器 */}
        <View style={styles.progressBar}>
          {chapters.map((ch, idx) => (
            <View 
              key={ch.id}
              style={[
                styles.progressDot,
                ch.id === chapterId && styles.progressDotActive,
                idx < chapters.findIndex(c => c.id === chapterId) && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      {/* 内容区域 */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentInner}
      >
        {/* 章节标题 */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{chapter.title}</Text>
          <Text style={styles.subTitle}>{chapter.titleCn}</Text>
          <View style={styles.metaInfo}>
            <Ionicons name="text-outline" size={14} color={palette.textLight} />
            <Text style={styles.metaText}>{chapter.wordCount} 词</Text>
            <Text style={styles.metaDot}>·</Text>
            <Ionicons name="time-outline" size={14} color={palette.textLight} />
            <Text style={styles.metaText}>{chapter.readTime} 分钟</Text>
          </View>
        </View>

        {/* 英文原文 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={18} color={palette.accent} />
            <Text style={styles.sectionTitle}>英文原文</Text>
          </View>
          <View style={styles.textBox}>
            {renderClickableText(chapter.content)}
          </View>
        </View>

        {/* 中文翻译 */}
        {showTranslation && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="language" size={18} color={palette.success} />
              <Text style={styles.sectionTitle}>中文翻译</Text>
            </View>
            <View style={[styles.textBox, styles.translationBox]}>
              {chapter.translation.split('\n\n').map((para, idx) => (
                <Text key={idx} style={[styles.translationText, { fontSize: fontSize - 1 }]}>
                  {para}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 词汇提示 */}
        <View style={styles.vocabularyTip}>
          <Ionicons name="information-circle" size={18} color={palette.primary} />
          <Text style={styles.tipText}>
            点击彩色单词查看释义、音标和例句
          </Text>
        </View>

        {/* 底部导航 */}
        <View style={styles.bottomNav}>
          {prevChapter ? (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigation.replace('ChapterDetail', { chapterId: prevChapter.id })}
            >
              <Ionicons name="chevron-back" size={20} color={palette.primary} />
              <View>
                <Text style={styles.navLabel}>上一章</Text>
                <Text style={styles.navTitle} numberOfLines={1}>{prevChapter.titleCn}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}

          {nextChapter ? (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => navigation.replace('ChapterDetail', { chapterId: nextChapter.id })}
            >
              <View style={styles.navTextRight}>
                <Text style={styles.navLabel}>下一章</Text>
                <Text style={styles.navTitle} numberOfLines={1}>{nextChapter.titleCn}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={palette.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}
        </View>
      </ScrollView>

      {/* 单词弹窗 */}
      <WordPopup 
        word={selectedWord || ''} 
        visible={!!selectedWord} 
        onClose={() => setSelectedWord(null)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  chapterNumber: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  chapterName: {
    ...typography.body1,
    color: '#FFF',
    fontWeight: '600',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFF',
    width: 20,
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  mainTitle: {
    ...typography.h4,
    color: palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  subTitle: {
    ...typography.body1,
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: palette.textLight,
    marginLeft: 4,
  },
  metaDot: {
    ...typography.caption,
    color: palette.textLight,
    marginHorizontal: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body1,
    color: palette.textPrimary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  textBox: {
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  paragraph: {
    ...typography.body1,
    color: palette.textPrimary,
    lineHeight: 28,
    marginBottom: spacing.md,
  },
  clickableWord: {
    color: palette.accent,
    fontWeight: '600',
  },
  translationBox: {
    backgroundColor: palette.grassLight + '20',
  },
  translationText: {
    ...typography.body1,
    color: palette.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  vocabularyTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  tipText: {
    ...typography.body2,
    color: palette.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navButtonRight: {
    justifyContent: 'flex-end',
  },
  navTextRight: {
    alignItems: 'flex-end',
  },
  navButtonPlaceholder: {
    flex: 1,
  },
  navLabel: {
    ...typography.caption,
    color: palette.textLight,
  },
  navTitle: {
    ...typography.body2,
    color: palette.primary,
    fontWeight: '600',
    maxWidth: 120,
  },
  // 单词弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  popupContainer: {
    width: '100%',
    maxWidth: 360,
  },
  popup: {
    backgroundColor: palette.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popupWord: {
    ...typography.h3,
    color: palette.textPrimary,
    fontWeight: '700',
  },
  soundButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: palette.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupPhonetic: {
    ...typography.body1,
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  meaningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: palette.border,
  },
  popupMeaning: {
    ...typography.h5,
    color: palette.textPrimary,
    fontWeight: '600',
  },
  levelTag: {
    backgroundColor: palette.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  levelText: {
    ...typography.caption,
    color: palette.primary,
    fontWeight: '600',
  },
  exampleBox: {
    marginTop: spacing.md,
  },
  exampleLabel: {
    ...typography.caption,
    color: palette.textLight,
    marginBottom: spacing.xs,
  },
  exampleText: {
    ...typography.body2,
    color: palette.textPrimary,
    lineHeight: 22,
  },
  exampleTranslation: {
    ...typography.caption,
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  closeButton: {
    marginTop: spacing.lg,
    backgroundColor: palette.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.body1,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default ChapterDetailScreen;
