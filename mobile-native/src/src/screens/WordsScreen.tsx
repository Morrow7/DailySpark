import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';

const { width } = Dimensions.get('window');

interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: string;
  isLearned: boolean;
}

const mockWords: Word[] = [
  {
    id: '1',
    word: 'Serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    meaning: '意外发现珍奇事物的本领',
    example: 'Finding this restaurant was pure serendipity.',
    category: '高级词汇',
    isLearned: false,
  },
  {
    id: '2',
    word: 'Ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    meaning: '短暂的，瞬息万变的',
    example: 'Fashion is ephemeral, changing with every season.',
    category: '高级词汇',
    isLearned: true,
  },
  {
    id: '3',
    word: 'Resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    meaning: '恢复力，弹力',
    example: 'She showed great resilience in the face of adversity.',
    category: '日常用语',
    isLearned: false,
  },
  {
    id: '4',
    word: 'Eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    meaning: '雄辩的，有说服力的',
    example: 'He gave an eloquent speech that moved the audience.',
    category: '日常用语',
    isLearned: false,
  },
  {
    id: '5',
    word: 'Meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    meaning: '一丝不苟的，严谨的',
    example: 'She is meticulous about keeping records.',
    category: '职场英语',
    isLearned: true,
  },
];

const categories = ['全部', '高级词汇', '日常用语', '职场英语', '考试词汇'];

const WordsScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addLearnedWords } = useAppStore();

  const filteredWords = mockWords.filter((word) => {
    const matchesCategory = selectedCategory === '全部' || word.category === selectedCategory;
    const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         word.meaning.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const markAsLearned = (word: Word) => {
    if (!word.isLearned) {
      addLearnedWords(1);
    }
  };

  const renderWordCard = ({ item }: { item: Word }) => {
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.wordCard}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={item.isLearned ? [palette.grassLight, palette.grass] : [palette.surface, palette.surface]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.wordHeader}>
            <View style={styles.wordTitle}>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.phoneticText}>{item.phonetic}</Text>
            </View>
            <View style={styles.wordActions}>
              {item.isLearned && (
                <View style={styles.learnedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={palette.success} />
                </View>
              )}
              <TouchableOpacity style={styles.speakButton}>
                <Ionicons name="volume-medium" size={20} color={palette.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {isExpanded && (
            <View style={styles.wordDetails}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>释义</Text>
                <Text style={styles.detailText}>{item.meaning}</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>例句</Text>
                <Text style={styles.exampleText}>{item.example}</Text>
              </View>
              {!item.isLearned && (
                <TouchableOpacity
                  style={styles.learnButton}
                  onPress={() => markAsLearned(item)}
                >
                  <LinearGradient
                    colors={[palette.primary, palette.primaryLight]}
                    style={styles.learnButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="checkmark" size={18} color={palette.cloud} />
                    <Text style={styles.learnButtonText}>标记已学</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <LinearGradient
        colors={[palette.primary, palette.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>每日单词</Text>
        <Text style={styles.headerSubtitle}>积累词汇，提升表达</Text>
      </LinearGradient>

      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={palette.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索单词..."
            placeholderTextColor={palette.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={palette.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 分类标签 */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* 单词列表 */}
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={renderWordCard}
        contentContainerStyle={styles.wordList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color={palette.textLight} />
            <Text style={styles.emptyText}>没有找到相关单词</Text>
          </View>
        }
      />

      {/* 底部统计 */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {mockWords.filter((w) => w.isLearned).length}
          </Text>
          <Text style={styles.statLabel}>已学</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {mockWords.filter((w) => !w.isLearned).length}
          </Text>
          <Text style={styles.statLabel}>待学</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round((mockWords.filter((w) => w.isLearned).length / mockWords.length) * 100)}%
          </Text>
          <Text style={styles.statLabel}>进度</Text>
        </View>
      </View>
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: palette.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body1,
    color: palette.textPrimary,
    paddingVertical: 8,
  },
  categoryContainer: {
    paddingVertical: spacing.sm,
  },
  categoryList: {
    paddingHorizontal: spacing.lg,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  categoryButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  categoryText: {
    ...typography.body2,
    color: palette.textSecondary,
  },
  categoryTextActive: {
    color: palette.cloud,
    fontWeight: '600',
  },
  wordList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  wordCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardGradient: {
    padding: spacing.md,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordTitle: {
    flex: 1,
  },
  wordText: {
    ...typography.h4,
    color: palette.textPrimary,
    fontWeight: '700',
  },
  phoneticText: {
    ...typography.body2,
    color: palette.textSecondary,
    marginTop: 2,
  },
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  learnedBadge: {
    marginRight: spacing.sm,
  },
  speakButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: palette.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  detailSection: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.caption,
    color: palette.textLight,
    marginBottom: 4,
  },
  detailText: {
    ...typography.body1,
    color: palette.textPrimary,
  },
  exampleText: {
    ...typography.body2,
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  learnButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  learnButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  learnButtonText: {
    ...typography.body2,
    color: palette.cloud,
    fontWeight: '600',
    marginLeft: spacing.xs,
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
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: palette.surface,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h4,
    color: palette.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: palette.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: palette.border,
  },
});

export default WordsScreen;
