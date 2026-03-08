import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackNavigationProp } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore, vipPlans } from '../store';
import { processVipPayment } from '../api/wechatPay';

const { width } = Dimensions.get('window');

interface VipBenefit {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const vipBenefits: VipBenefit[] = [
  {
    icon: 'mic',
    title: '无限语音对话',
    description: '与AI助手进行无限次语音交流',
  },
  {
    icon: 'book',
    title: '全部单词解锁',
    description: '访问所有高级词汇和短语',
  },
  {
    icon: 'newspaper',
    title: '专属阅读内容',
    description: '解锁VIP专属文章和材料',
  },
  {
    icon: 'cloud-download',
    title: '离线下载',
    description: '下载内容离线学习',
  },
  {
    icon: 'stats-chart',
    title: '详细学习报告',
    description: '获取个性化学习分析',
  },
  {
    icon: 'headset',
    title: '优先客服支持',
    description: '享受VIP专属客服通道',
  },
];

const VipScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, isLoggedIn, setUser } = useAppStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedPlan) {
      Alert.alert('提示', '请选择一个会员套餐');
      return;
    }

    if (!isLoggedIn) {
      Alert.alert('提示', '请先登录后再购买会员', [
        { text: '取消', style: 'cancel' },
        { text: '去登录', onPress: () => navigation.navigate('MainTabs', { screen: 'Mine' }) },
      ]);
      return;
    }

    const plan = vipPlans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    setIsProcessing(true);

    try {
      const result = await processVipPayment(
        plan.id,
        plan.name,
        plan.price,
        user?.id
      );

      if (result.success) {
        // 更新用户VIP状态
        const expireTime = Date.now() + plan.duration * 24 * 60 * 60 * 1000;
        setUser({
          ...user!,
          isVip: true,
          vipExpireTime: expireTime,
        });

        Alert.alert(
          '支付成功',
          `恭喜您成为${plan.name}！\n有效期至: ${new Date(expireTime).toLocaleDateString()}`,
          [{ text: '确定', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('支付失败', result.errMsg || '请重试');
      }
    } catch (error) {
      Alert.alert('错误', '支付过程中出现错误，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPlanCard = (plan: typeof vipPlans[0]) => {
    const isSelected = selectedPlan === plan.id;
    const isHot = plan.isHot;

    return (
      <TouchableOpacity
        key={plan.id}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          isHot && styles.planCardHot,
        ]}
        onPress={() => setSelectedPlan(plan.id)}
        activeOpacity={0.8}
      >
        {isHot && (
          <View style={styles.hotBadge}>
            <LinearGradient
              colors={[palette.error, '#FF6B6B']}
              style={styles.hotGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.hotText}>HOT</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currency}>¥</Text>
            <Text style={styles.price}>{plan.price}</Text>
          </View>
          <Text style={styles.originalPrice}>原价 ¥{plan.originalPrice}</Text>
        </View>

        <View style={styles.planDivider} />

        <View style={styles.planFooter}>
          <Text style={styles.planDescription}>{plan.description}</Text>
          <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color={palette.cloud} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <LinearGradient
        colors={[palette.vipGold, palette.vipGoldDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* 装饰 */}
        <View style={styles.decorations}>
          <View style={[styles.star, styles.star1]}>
            <Ionicons name="star" size={30} color="rgba(255,255,255,0.3)" />
          </View>
          <View style={[styles.star, styles.star2]}>
            <Ionicons name="star" size={20} color="rgba(255,255,255,0.2)" />
          </View>
          <View style={[styles.star, styles.star3]}>
            <Ionicons name="star" size={25} color="rgba(255,255,255,0.25)" />
          </View>
        </View>

        <View style={styles.headerContent}>
          <View style={styles.crownContainer}>
            <Ionicons name="diamond" size={60} color={palette.cloud} />
          </View>
          <Text style={styles.headerTitle}>升级VIP会员</Text>
          <Text style={styles.headerSubtitle}>解锁全部高级功能，享受极致学习体验</Text>
        </View>
      </LinearGradient>

      {/* 会员权益 */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>会员权益</Text>
        <View style={styles.benefitsGrid}>
          {vipBenefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: palette.vipGold + '20' }]}>
                <Ionicons name={benefit.icon} size={24} color={palette.vipGoldDark} />
              </View>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>{benefit.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 套餐选择 */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>选择套餐</Text>
        <View style={styles.plansContainer}>
          {vipPlans.map(renderPlanCard)}
        </View>
      </View>

      {/* 支付按钮 */}
      <View style={styles.paymentSection}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedPlan || isProcessing) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!selectedPlan || isProcessing}
        >
          <LinearGradient
            colors={[palette.vipGold, palette.vipGoldDark]}
            style={styles.payGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="lock-closed" size={20} color={palette.cloud} />
            <Text style={styles.payButtonText}>
              {isProcessing ? '处理中...' : '立即开通'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.paymentMethods}>
          <View style={styles.paymentMethod}>
            <Ionicons name="chatbubble" size={20} color="#07C160" />
            <Text style={styles.paymentMethodText}>微信支付</Text>
          </View>
          <Text style={styles.secureText}>安全加密支付</Text>
        </View>

        <Text style={styles.termsText}>
          开通即表示同意《VIP会员服务协议》和《自动续费服务协议》
        </Text>
      </View>

      {/* 底部装饰 */}
      <View style={styles.footerDecoration}>
        <Ionicons name="leaf" size={40} color={palette.grassLight} />
      </View>
    </ScrollView>
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
    paddingBottom: spacing.xl,
    position: 'relative',
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: 30,
    right: 30,
  },
  star2: {
    top: 80,
    left: 20,
  },
  star3: {
    bottom: 30,
    right: 60,
  },
  headerContent: {
    alignItems: 'center',
  },
  crownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTitle: {
    ...typography.h2,
    color: palette.cloud,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  benefitsSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  benefitItem: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    margin: spacing.xs,
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitTitle: {
    ...typography.body2,
    color: palette.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDescription: {
    ...typography.caption,
    color: palette.textLight,
    textAlign: 'center',
  },
  plansSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planCard: {
    width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: palette.border,
    position: 'relative',
    ...shadows.sm,
  },
  planCardSelected: {
    borderColor: palette.vipGold,
    backgroundColor: palette.vipGoldLight,
  },
  planCardHot: {
    marginTop: 20,
  },
  hotBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -25 }],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  hotGradient: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  hotText: {
    ...typography.caption,
    color: palette.cloud,
    fontWeight: '700',
    fontSize: 10,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planName: {
    ...typography.body2,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    ...typography.body1,
    color: palette.vipGoldDark,
    fontWeight: '600',
    marginTop: 4,
  },
  price: {
    ...typography.h2,
    color: palette.vipGoldDark,
    fontWeight: '800',
  },
  originalPrice: {
    ...typography.caption,
    color: palette.textLight,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  planDivider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm,
  },
  planFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planDescription: {
    flex: 1,
    ...typography.caption,
    color: palette.textSecondary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleSelected: {
    backgroundColor: palette.vipGold,
    borderColor: palette.vipGold,
  },
  paymentSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  payButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  payButtonText: {
    ...typography.h5,
    color: palette.cloud,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  paymentMethods: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  paymentMethodText: {
    ...typography.caption,
    color: palette.textSecondary,
    marginLeft: 4,
  },
  secureText: {
    ...typography.caption,
    color: palette.success,
  },
  termsText: {
    ...typography.caption,
    color: palette.textLight,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footerDecoration: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
});

export default VipScreen;
