import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackNavigationProp } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';
import { wechatLogin, getWechatUserInfo, WechatUserInfo } from '../services/wechat';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  badge?: number;
  isNew?: boolean;
}

const MineScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { user, isLoggedIn, setUser, logout, checkVipStatus } = useAppStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleWechatLogin = async () => {
    setIsLoggingIn(true);
    try {
      // 步骤1：获取微信授权码
      const loginResult = await wechatLogin();
      
      if (!loginResult.success || !loginResult.code) {
        if (loginResult.error?.includes('取消')) {
          // 用户取消，静默处理
          return;
        }
        throw new Error(loginResult.error || '登录失败');
      }

      // 步骤2：使用 code 获取用户信息
      const wechatUser = await getWechatUserInfo(loginResult.code);
      
      if (!wechatUser) {
        throw new Error('获取用户信息失败');
      }

      // 步骤3：创建/更新用户数据
      const userInfo = {
        id: wechatUser.openid,
        nickname: wechatUser.nickname,
        avatar: wechatUser.avatar,
        phone: undefined,
        isVip: false,
        createdAt: Date.now(),
      };

      setUser(userInfo);
      Alert.alert('登录成功', `欢迎，${userInfo.nickname}！`);
    } catch (error) {
      console.error('登录失败:', error);
      Alert.alert('登录失败', error instanceof Error ? error.message : '请重试');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('已退出登录');
          }
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'diamond',
      title: 'VIP会员',
      subtitle: checkVipStatus() ? '会员有效期至 2025-12-31' : '解锁更多高级功能',
      onPress: () => navigation.navigate('Vip'),
      showArrow: true,
      isNew: !checkVipStatus(),
    },
    {
      icon: 'time',
      title: '学习记录',
      subtitle: '查看你的学习历程',
      onPress: () => {},
      showArrow: true,
    },
    {
      icon: 'bookmark',
      title: '我的收藏',
      subtitle: '收藏的单词和文章',
      onPress: () => {},
      showArrow: true,
      badge: 12,
    },
    {
      icon: 'trophy',
      title: '成就徽章',
      subtitle: '已获得 5 个徽章',
      onPress: () => {},
      showArrow: true,
    },
    {
      icon: 'settings',
      title: '设置',
      onPress: () => {},
      showArrow: true,
    },
    {
      icon: 'help-circle',
      title: '帮助与反馈',
      onPress: () => {},
      showArrow: true,
    },
    {
      icon: 'share',
      title: '分享给好友',
      onPress: () => {},
      showArrow: true,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部背景 */}
      <LinearGradient
        colors={[palette.primary, palette.primaryLight]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* 装饰 */}
        <View style={styles.decorations}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
        </View>

        {/* 用户信息卡片 */}
        <View style={styles.userCard}>
          {isLoggedIn ? (
            <>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.nickname?.[0] || 'U'}</Text>
                  </View>
                )}
                {checkVipStatus() && (
                  <View style={styles.vipBadge}>
                    <Ionicons name="diamond" size={12} color={palette.vipGold} />
                  </View>
                )}
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.nickname || '用户'}</Text>
                <Text style={styles.userId}>ID: {user?.id?.slice(-8) || '00000000'}</Text>
                {checkVipStatus() && (
                  <View style={styles.vipTag}>
                    <LinearGradient
                      colors={[palette.vipGold, palette.vipGoldDark]}
                      style={styles.vipGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="star" size={12} color={palette.cloud} />
                      <Text style={styles.vipTagText}>VIP会员</Text>
                    </LinearGradient>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.editButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color={palette.cloud} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color={palette.cloud} />
                </View>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>游客</Text>
                <Text style={styles.userId}>登录后解锁更多功能</Text>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleWechatLogin}
                disabled={isLoggingIn}
              >
                <LinearGradient
                  colors={['#07C160', '#05a350']}
                  style={styles.loginGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="chatbubble" size={18} color={palette.cloud} />
                  <Text style={styles.loginButtonText}>
                    {isLoggingIn ? '登录中...' : '微信登录'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 统计信息 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>学习天数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>328</Text>
            <Text style={styles.statLabel}>已学单词</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>阅读文章</Text>
          </View>
        </View>
      </LinearGradient>

      {/* 菜单列表 */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === menuItems.length - 1 && styles.menuItemLast,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: getIconColor(index) + '15' }]}>
              <Ionicons name={item.icon} size={22} color={getIconColor(index)} />
            </View>
            
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.subtitle && (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              )}
            </View>

            <View style={styles.menuRight}>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              {item.isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
              {item.showArrow && (
                <Ionicons name="chevron-forward" size={20} color={palette.textLight} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 版本信息 */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>版本 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2025 每日英语 All Rights Reserved</Text>
      </View>
    </ScrollView>
  );
};

// 获取图标颜色
const getIconColor = (index: number): string => {
  const colors = [
    palette.vipGold,
    palette.primary,
    palette.grass,
    palette.accent,
    palette.secondary,
    palette.textSecondary,
    palette.info,
  ];
  return colors[index % colors.length];
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
    position: 'relative',
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: 150,
    height: 150,
    top: -50,
    right: -30,
  },
  circle2: {
    width: 100,
    height: 100,
    bottom: 50,
    left: -30,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.cloud,
  },
  vipBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.vipGold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  userName: {
    ...typography.h4,
    color: palette.cloud,
    fontWeight: '700',
    marginBottom: 4,
  },
  userId: {
    ...typography.body2,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  vipTag: {
    alignSelf: 'flex-start',
  },
  vipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  vipTagText: {
    ...typography.caption,
    color: palette.cloud,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loginButtonText: {
    ...typography.body2,
    color: palette.cloud,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: palette.cloud,
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
  menuContainer: {
    margin: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    ...typography.body1,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  menuSubtitle: {
    ...typography.caption,
    color: palette.textLight,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    paddingHorizontal: 6,
  },
  badgeText: {
    ...typography.caption,
    color: palette.cloud,
    fontWeight: '600',
    fontSize: 11,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: palette.error,
    marginRight: spacing.xs,
  },
  newBadgeText: {
    ...typography.caption,
    color: palette.cloud,
    fontWeight: '600',
    fontSize: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    ...typography.caption,
    color: palette.textLight,
    marginBottom: 4,
  },
  copyrightText: {
    ...typography.caption,
    color: palette.textLight,
    fontSize: 11,
  },
});

export default MineScreen;
