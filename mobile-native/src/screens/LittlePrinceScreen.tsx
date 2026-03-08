import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { littlePrinceBook, chapters, getTotalWordCount } from '../data/littlePrince';

const { width } = Dimensions.get('window');

interface Chapter {
  id: string;
  number: number;
  title: string;
  titleCn: string;
  wordCount: number;
  readTime: number;
}

const LittlePrinceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  const navigateToChapter = (chapterId: string) => {
    navigation.navigate('ChapterDetail', { chapterId });
  };

  const renderChapterItem = ({ item, index }: { item: Chapter; index: number }) => {
    const isCompleted = completedChapters.includes(item.id);
    const progress = isCompleted ? 100 : 0;

    return (
      <TouchableOpacity
        style={[
          styles.chapterCard,
          isCompleted && styles.chapterCardCompleted,
        ]}
        onPress={() => navigateToChapter(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.chapterNumber}>
          <LinearGradient
            colors={[palette.accent, palette.primaryLight]}
            style={styles.numberGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.numberText}>{item.number}</Text>
          </LinearGradient>
        </View>

        <View style={styles.chapterContent}>
          <Text style={styles.chapterTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.chapterTitleCn} numberOfLines={1}>
            {item.titleCn}
          </Text>
          
          <View style={styles.chapterMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="text-outline" size={14} color={palette.textLight} />
              <Text style={styles.metaText}>{item.wordCount} 词</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={palette.textLight} />
              <Text style={styles.metaText}>{item.readTime} 分钟</Text>
            </View>
          </View>

          {/* 进度条 */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.chapterArrow}>
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={24} color={palette.success} />
          ) : (
            <Ionicons name="chevron-forward" size={24} color={palette.textLight} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#FF9A9E', '#FECFEF']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* 书籍信息 */}
        <View style={styles.bookInfo}>
          <View style={styles.bookIcon}>
            <Ionicons name="planet" size={60} color="rgba(255,255,255,0.3)" />
          </View>
          
          <Text style={styles.bookTitle}>{littlePrinceBook.title}</Text>
          <Text style={styles.bookTitleCn}>{littlePrinceBook.titleCn}</Text>
          
          <View style={styles.authorRow}>
            <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.authorText}>{littlePrinceBook.author}</Text>
          </View>

          {/* 统计信息 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{littlePrinceBook.totalChapters}</Text>
              <Text style={styles.statLabel}>章节</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{(getTotalWordCount() / 1000).toFixed(1)}k</Text>
              <Text style={styles.statLabel}>词汇</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedChapters.length}</Text>
              <Text style={styles.statLabel}>已读</Text>
            </View>
          </View>
        </View>

        {/* 引言 */}
        <View style={styles.quoteBox}>
          <Ionicons name="quote" size={20} color="rgba(255,255,255,0.4)" />
          <Text style={styles.quoteText}>
            "It is only with the heart that one can see rightly; what is essential is invisible to the eye."
          </Text>
          <Text style={styles.quoteTranslation}>
            只有用心才能看清事物的本质；真正重要的东西用眼睛是看不见的。
          </Text>
        </View>
      </LinearGradient>

      {/* 章节标题 */}
      <View style={styles.chaptersHeader}>
        <Text style={styles.chaptersTitle}>章节目录</Text>
        <Text style={styles.chaptersSubtitle}>
          共 {littlePrinceBook.totalChapters} 章
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        renderItem={renderChapterItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerGradient: {
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bookInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  bookIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bookTitle: {
    ...typography.h2,
    color: '#FFF',
    fontWeight: '800',
  },
  bookTitleCn: {
    ...typography.h4,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  authorText: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statNumber: {
    ...typography.h3,
    color: '#FFF',
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  quoteBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  quoteText: {
    ...typography.body2,
    color: '#FFF',
    fontStyle: 'italic',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  quoteTranslation: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
  },
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  chaptersTitle: {
    ...typography.h4,
    color: palette.textPrimary,
    fontWeight: '700',
  },
  chaptersSubtitle: {
    ...typography.body2,
    color: palette.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: palette.border,
    marginHorizontal: spacing.lg,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: palette.surface,
  },
  chapterCardCompleted: {
    backgroundColor: palette.success + '08',
  },
  chapterNumber: {
    marginRight: spacing.md,
  },
  numberGradient: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    ...typography.h5,
    color: '#FFF',
    fontWeight: '700',
  },
  chapterContent: {
    flex: 1,
  },
  chapterTitle: {
    ...typography.body1,
    color: palette.textPrimary,
    fontWeight: '600',
  },
  chapterTitleCn: {
    ...typography.body2,
    color: palette.textSecondary,
    marginTop: 2,
  },
  chapterMeta: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    ...typography.caption,
    color: palette.textLight,
    marginLeft: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: palette.border,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.success,
    borderRadius: borderRadius.round,
  },
  chapterArrow: {
    marginLeft: spacing.sm,
  },
});

export default LittlePrinceScreen;
