import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackNavigationProp } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';
import { loginWithWechat, mockWechatLogin } from '../api/wechat';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { setUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleWechatLogin = async () => {
    setIsLoading(true);
    try {
      // 实际项目中使用 loginWithWechat()
      const result = await mockWechatLogin();
      
      const userInfo = {
        id: result.openid,
        nickname: result.userInfo.nickname,
        avatar: result.userInfo.headimgurl,
        phone: undefined,
        isVip: false,
        createdAt: Date.now(),
      };

      setUser(userInfo);
      Alert.alert('登录成功', `欢迎回来，${userInfo.nickname}`, [
        { text: '确定', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('登录失败', error instanceof Error ? error.message : '请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    Alert.alert(
      '游客模式',
      '游客模式下部分功能受限，建议登录以获得完整体验',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '继续', 
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 返回按钮 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={palette.textPrimary} />
        </TouchableOpacity>

        {/* Logo区域 */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[palette.primary, palette.primaryLight]}
            style={styles.logoContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="leaf" size={60} color={palette.cloud} />
          </LinearGradient>
          <Text style={styles.appName}>每日英语</Text>
          <Text style={styles.appSlogan}>让学习成为一种习惯</Text>
        </View>

        {/* 登录选项 */}
        <View style={styles.loginSection}>
          <Text style={styles.loginTitle}>欢迎登录</Text>
          <Text style={styles.loginSubtitle}>选择以下方式登录</Text>

          {/* 微信登录按钮 */}
          <TouchableOpacity
            style={styles.wechatButton}
            onPress={handleWechatLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#07C160', '#05a350']}
              style={styles.wechatGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="chatbubble" size={24} color={palette.cloud} />
              <Text style={styles.wechatButtonText}>
                {isLoading ? '登录中...' : '微信登录'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 游客登录 */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestLogin}
          >
            <Text style={styles.guestButtonText}>游客模式</Text>
          </TouchableOpacity>
        </View>

        {/* 协议说明 */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            登录即表示您同意
            <Text style={styles.termsLink}>《用户协议》</Text>
            和
            <Text style={styles.termsLink}>《隐私政策》</Text>
          </Text>
        </View>

        {/* 底部装饰 */}
        <View style={styles.footerDecoration}>
          <View style={styles.grassRow}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={styles.grassBlade} />
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 1,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  appName: {
    ...typography.h2,
    color: palette.textPrimary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  appSlogan: {
    ...typography.body1,
    color: palette.textSecondary,
  },
  loginSection: {
    backgroundColor: palette.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  loginTitle: {
    ...typography.h3,
    color: palette.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  loginSubtitle: {
    ...typography.body2,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  wechatButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  wechatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  wechatButtonText: {
    ...typography.h5,
    color: palette.cloud,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  guestButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  guestButtonText: {
    ...typography.body1,
    color: palette.textSecondary,
  },
  termsSection: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  termsText: {
    ...typography.caption,
    color: palette.textLight,
    textAlign: 'center',
  },
  termsLink: {
    color: palette.primary,
    fontWeight: '500',
  },
  footerDecoration: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  grassRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  grassBlade: {
    width: 4,
    height: 25,
    backgroundColor: palette.grassLight,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginHorizontal: 4,
    transform: [{ rotate: `${Math.random() * 10 - 5}deg` }],
  },
});

export default LoginScreen;
