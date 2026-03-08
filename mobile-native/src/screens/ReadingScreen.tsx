import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';
import { littlePrinceBook, chapters as littlePrinceChapters } from '../data/littlePrince';

const { width } = Dimensions.get('window');

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  readTime: number;
  wordCount: number;
  isCompleted: boolean;
  imageColor: string;
}

const mockArticles: Article[] = [
  {
    id: 'prince',
    title: 'The Little Prince',
    excerpt: 'A timeless tale about a young prince who travels the universe and learns about life, love, and friendship...',
    category: '文学',
    difficulty: 'medium',
    readTime: 15,
    wordCount: 1200,
    isCompleted: false,
    imageColor: palette.accent,
  },
  {
    id: '1',
    title: 'The Power of Morning Routines',
    excerpt: 'Discover how successful people start their day and learn to build your own productive morning routine...',
    category: '生活方式',
    difficulty: 'easy',
    readTime: 5,
    wordCount: 450,
    isCompleted: true,
    imageColor: palette.secondary,
  },
  {
    id: '2',
    title: 'Understanding Climate Change',
    excerpt: 'A comprehensive guide to the science behind global warming and its impact on our planet...',
    category: '科学',
    difficulty: 'medium',
    readTime: 8,
    wordCount: 720,
    isCompleted: false,
    imageColor: palette.grass,
  },
  {
    id: '3',
    title: 'The Art of Storytelling',
    excerpt: 'Learn the essential techniques that make stories compelling and memorable...',
    category: '文学',
    difficulty: 'medium',
    readTime: 6,
    wordCount: 580,
    isCompleted: false,
    imageColor: palette.accent,
  },
  {
    id: '4',
    title: 'Artificial Intelligence in Healthcare',
    excerpt: 'Explore how AI is revolutionizing medical diagnosis and patient care...',
    category: '科技',
    difficulty: 'hard',
    readTime: 10,
    wordCount: 950,
    isCompleted: false,
    imageColor: palette.primary,
  },
  {
    id: '5',
    title: 'Minimalist Living Guide',
    excerpt: 'Simplify your life and find happiness with less. A practical guide to minimalism...',
    category: '生活方式',
    difficulty: 'easy',
    readTime: 4,
    wordCount: 380,
    isCompleted: true,
    imageColor: palette.vipGold,
  },
];

const categories = ['全部', '生活方式', '科学', '文学', '科技', '历史', '商业'];
const difficulties = [
  { key: 'all', label: '全部', color: palette.textLight },
  { key: 'easy', label: '简单', color: palette.success },
  { key: 'medium', label: '中等', color: palette.warning },
  { key: 'hard', label: '困难', color: palette.error },
];

const ReadingScreen: React.FC = () => {
  const navigation = useNavigation<MainTabNavigationProp | any>();
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { updateReadingProgress } = useAppStore();

  const navigateToArticleDetail = (articleId: string) => {
    navigation.navigate('ArticleDetail', { articleId });
  };

  const navigateToLittlePrince = () => {
    navigation.navigate('LittlePrince');
  };

  const filteredArticles = mockArticles.filter((article) => {
    const matchesCategory = selectedCategory === '全部' || article.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return palette.success;
      case 'medium':
        return palette.warning;
      case 'hard':
        return palette.error;
      default:
        return palette.textLight;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return difficulty;
    }
  };

  const renderArticleCard = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => navigateToArticleDetail(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* 左侧颜色条 */}
        <View style={[styles.colorBar, { backgroundColor: item.imageColor }]} />
        
        <View style={styles.cardBody}>
          {/* 标题和完成标记 */}
          <View style={styles.cardHeader}>
            <Text style={styles.articleTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.isCompleted && (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={palette.success} />
              </View>
            )}
          </View>

          {/* 摘要 */}
          <Text style={styles.articleExcerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>

          {/* 底部信息 */}
          <View style={styles.cardFooter}>
            <View style={styles.tagContainer}>
              <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                  {getDifficultyLabel(item.difficulty)}
                </Text>
              </View>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
            
            <View style={styles.readInfo}>
              <Ionicons name="time-outline" size={14} color={palette.textLight} />
              <Text style={styles.readInfoText}>{item.readTime}分钟</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.readInfoText}>{item.wordCount}词</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <LinearGradient
        colors={[palette.primary, palette.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>英语阅读</Text>
        <Text style={styles.headerSubtitle}>每天进步一点点</Text>
        
        {/* 阅读统计 */}
        <View style={styles.readingStats}>
          <View style={styles.readingStatItem}>
            <Text style={styles.readingStatNumber}>12</Text>
            <Text style={styles.readingStatLabel}>已读文章</Text>
          </View>
          <View style={styles.readingStatDivider} />
          <View style={styles.readingStatItem}>
            <Text style={styles.readingStatNumber}>3.5k</Text>
            <Text style={styles.readingStatLabel}>阅读词汇</Text>
          </View>
          <View style={styles.readingStatDivider} />
          <View style={styles.readingStatItem}>
            <Text style={styles.readingStatNumber}>5</Text>
            <Text style={styles.readingStatLabel}>连续天数</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 筛选栏 */}
      <View style={styles.filterContainer}>
        {/* 难度筛选 */}
        <View style={styles.difficultyFilter}>
          {difficulties.map((diff) => (
            <TouchableOpacity
              key={diff.key}
              style={[
                styles.difficultyButton,
                selectedDifficulty === diff.key && styles.difficultyButtonActive,
              ]}
              onPress={() => setSelectedDifficulty(diff.key)}
            >
              <Text
                style={[
                  styles.difficultyButtonText,
                  selectedDifficulty === diff.key && { color: diff.color, fontWeight: '600' },
                ]}
              >
                {diff.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 分类筛选 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 文章列表 */}
      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={renderArticleCard}
        contentContainerStyle={styles.articleList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.bookSection}>
            <Text style={styles.sectionTitle}>经典书籍</Text>
            <TouchableOpacity
              style={styles.bookCard}
              onPress={navigateToLittlePrince}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF9A9E', '#FECFEF']}
                style={styles.bookGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.bookContent}>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{littlePrinceBook.title}</Text>
                    <Text style={styles.bookTitleCn}>{littlePrinceBook.titleCn}</Text>
                    <Text style={styles.bookAuthor}>{littlePrinceBook.author}</Text>
                    <Text style={styles.bookDescription} numberOfLines={2}>
                      {littlePrinceBook.descriptionCn}
                    </Text>
                    <View style={styles.bookStats}>
                      <View style={styles.bookStat}>
                        <Ionicons name="book-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.bookStatText}>{littlePrinceBook.totalChapters} 章</Text>
                      </View>
                      <View style={styles.bookStat}>
                        <Ionicons name="text-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.bookStatText}>{(littlePrinceBook.totalWordCount / 1000).toFixed(1)}k 词</Text>
                      </View>
                      <View style={styles.bookStat}>
                        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.bookStatText}>约{Math.ceil(littlePrinceBook.totalWordCount / 200)}分钟</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.bookIcon}>
                    <Ionicons name="planet" size={50} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
                <View style={styles.readButton}>
                  <Text style={styles.readButtonText}>开始阅读</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={60} color={palette.textLight} />
            <Text style={styles.emptyText}>暂无相关文章</Text>
          </View>
        }
      />
    </View>
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
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: palette.cloud,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  readingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  readingStatItem: {
    alignItems: 'center',
  },
  readingStatNumber: {
    ...typography.h3,
    color: palette.cloud,
    fontWeight: '700',
  },
  readingStatLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  readingStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterContainer: {
    backgroundColor: palette.surface,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  difficultyFilter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  difficultyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: palette.background,
  },
  difficultyButtonActive: {
    backgroundColor: palette.primary + '15',
  },
  difficultyButtonText: {
    ...typography.body2,
    color: palette.textSecondary,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
  },
  categoryButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  categoryButtonText: {
    ...typography.body2,
    color: palette.textSecondary,
  },
  categoryButtonTextActive: {
    color: palette.cloud,
    fontWeight: '600',
  },
  articleList: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  articleCard: {
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardContent: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  colorBar: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  articleTitle: {
    flex: 1,
    ...typography.h5,
    color: palette.textPrimary,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  completedBadge: {
    marginLeft: spacing.xs,
  },
  articleExcerpt: {
    ...typography.body2,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
  },
  difficultyTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
  },
  difficultyText: {
    ...typography.caption,
    fontWeight: '500',
  },
  categoryTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: palette.background,
  },
  categoryText: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  readInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readInfoText: {
    ...typography.caption,
    color: palette.textLight,
    marginLeft: 4,
  },
  dot: {
    ...typography.caption,
    color: palette.textLight,
    marginHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body1,
    color: palette.textLight,
    marginTop: spacing.md,
  },
  // 书籍区域
  bookSection: {
    marginBottom: spacing.lg,
  },
  bookCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  bookGradient: {
    padding: spacing.lg,
  },
  bookContent: {
    flexDirection: 'row',
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: '700',
  },
  bookTitleCn: {
    ...typography.body1,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  bookAuthor: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  bookDescription: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  bookStats: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  bookStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookStatText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  bookIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  readButtonText: {
    ...typography.body2,
    color: '#FFF',
    fontWeight: '600',
    marginRight: spacing.xs,
  },
});

export default ReadingScreen;
