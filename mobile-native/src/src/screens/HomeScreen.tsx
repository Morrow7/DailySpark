import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabNavigationProp } from '../navigation/types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import RabbitEatingGrass from '../components/RabbitEatingGrass';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<MainTabNavigationProp>();
  const { user, isLoggedIn, studyDays, learnedWords, readingProgress } = useAppStore();
  const [greeting, setGreeting] = useState('');

  // 动画值
  const cloud1Position = useSharedValue(0);
  const cloud2Position = useSharedValue(0);
  const grassSway = useSharedValue(0);
  const cardScale = useSharedValue(0.9);

  useEffect(() => {
    // 根据时间设置问候语
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('早上好');
    } else if (hour < 18) {
      setGreeting('下午好');
    } else {
      setGreeting('晚上好');
    }

    // 云朵飘动动画
    cloud1Position.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 3000 }),
        withTiming(-20, { duration: 3000 })
      ),
      -1,
      true
    );

    cloud2Position.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 4000 }),
        withTiming(15, { duration: 4000 })
      ),
      -1,
      true
    );

    // 草摆动动画
    grassSway.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000 }),
        withTiming(-5, { duration: 2000 })
      ),
      -1,
      true
    );

    // 卡片入场动画
    cardScale.value = withSpring(1, { damping: 12 });
  }, []);

  const cloud1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud1Position.value }],
  }));

  const cloud2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud2Position.value }],
  }));

  const grassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${grassSway.value}deg` }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: interpolate(cardScale.value, [0.9, 1], [0.7, 1]),
  }));

  const quickActions = [
    {
      icon: 'mic' as const,
      title: '语音对话',
      subtitle: 'AI语音聊天',
      color: palette.primary,
      onPress: () => navigation.navigate('Chat'),
    },
    {
      icon: 'book' as const,
      title: '每日单词',
      subtitle: '已学 ' + learnedWords + ' 词',
      color: palette.grass,
      onPress: () => navigation.navigate('Words'),
    },
    {
      icon: 'newspaper' as const,
      title: '阅读训练',
      subtitle: '进度 ' + readingProgress + '%',
      color: palette.secondary,
      onPress: () => navigation.navigate('Reading'),
    },
    {
      icon: 'diamond' as const,
      title: 'VIP会员',
      subtitle: '解锁更多功能',
      color: palette.vipGold,
      onPress: () => navigation.navigate('Vip'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 顶部渐变背景 */}
      <LinearGradient
        colors={[palette.primary, palette.primaryLight, palette.background]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* 装饰云朵 */}
        <Animated.View style={[styles.cloud, styles.cloud1, cloud1Style]}>
          <Ionicons name="cloud" size={60} color="rgba(255,255,255,0.3)" />
        </Animated.View>
        <Animated.View style={[styles.cloud, styles.cloud2, cloud2Style]}>
          <Ionicons name="cloud" size={40} color="rgba(255,255,255,0.2)" />
        </Animated.View>

        {/* 用户信息 */}
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {isLoggedIn && user?.avatar ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.nickname[0]}</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Ionicons name="person-circle" size={48} color={palette.cloud} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {greeting}，{isLoggedIn ? user?.nickname : '游客'}
            </Text>
            <Text style={styles.subGreeting}>
              {isLoggedIn ? '今天也是学习的好日子' : '登录解锁更多功能'}
            </Text>
          </View>
          {isLoggedIn && user?.isVip && (
            <View style={styles.vipBadge}>
              <Ionicons name="diamond" size={16} color={palette.vipGold} />
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}
        </View>

        {/* 兔子吃草动画 */}
        <View style={styles.rabbitContainer}>
          <RabbitEatingGrass size={180} />
        </View>
      </LinearGradient>

      {/* 内容区域 */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 学习统计卡片 */}
        <Animated.View style={[styles.statsCard, cardStyle]}>
          <LinearGradient
            colors={[palette.grassLight, palette.grass]}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{studyDays}</Text>
              <Text style={styles.statLabel}>学习天数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{learnedWords}</Text>
              <Text style={styles.statLabel}>已学单词</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{readingProgress}%</Text>
              <Text style={styles.statLabel}>阅读进度</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* 快捷功能 */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>快捷功能</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 今日推荐 */}
        <View style={styles.recommendSection}>
          <Text style={styles.sectionTitle}>今日推荐</Text>
          <TouchableOpacity style={styles.recommendCard} activeOpacity={0.8}>
            <LinearGradient
              colors={[palette.secondaryLight, palette.secondary]}
              style={styles.recommendGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.recommendContent}>
                <View style={styles.recommendIcon}>
                  <Ionicons name="sunny" size={32} color={palette.accent} />
                </View>
                <View style={styles.recommendText}>
                  <Text style={styles.recommendTitle}>每日一句</Text>
                  <Text style={styles.recommendQuote}>
                    "The only way to do great work is to love what you do."
                  </Text>
                  <Text style={styles.recommendAuthor}>— Steve Jobs</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 底部装饰草 */}
        <Animated.View style={[styles.grassDecoration, grassStyle]}>
          <View style={styles.grassRow}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.grassBlade}>
                <View style={styles.grassStem} />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  headerGradient: {
    height: 280,
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
  },
  cloud1: {
    top: 40,
    right: 20,
  },
  cloud2: {
    top: 80,
    left: 30,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: palette.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.cloud,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  loginButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    ...typography.h4,
    color: palette.cloud,
    marginBottom: 4,
  },
  subGreeting: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.8)',
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.vipGoldLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  vipText: {
    ...typography.caption,
    color: palette.vipGoldDark,
    fontWeight: '700',
    marginLeft: 4,
  },
  rabbitContainer: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    zIndex: 2,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  statsCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: palette.cloud,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  quickActions: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h5,
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  actionItem: {
    width: (width - spacing.lg * 2 - spacing.md * 2) / 2,
    margin: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.body1,
    color: palette.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    ...typography.caption,
    color: palette.textLight,
  },
  recommendSection: {
    marginBottom: spacing.lg,
  },
  recommendCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  recommendGradient: {
    padding: spacing.lg,
  },
  recommendContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendIcon: {
    marginRight: spacing.md,
  },
  recommendText: {
    flex: 1,
  },
  recommendTitle: {
    ...typography.body1,
    color: palette.primaryDark,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  recommendQuote: {
    ...typography.body2,
    color: palette.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  recommendAuthor: {
    ...typography.caption,
    color: palette.textSecondary,
    textAlign: 'right',
  },
  grassDecoration: {
    height: 30,
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  grassRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  grassBlade: {
    alignItems: 'center',
  },
  grassStem: {
    width: 3,
    height: 20,
    backgroundColor: palette.grassLight,
    borderRadius: 2,
  },
});

export default HomeScreen;
