import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackNavigationProp } from '../navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, typography, spacing, shadows, borderRadius } from '../theme';
import { useAppStore } from '../store';
import { 
  initWechat, 
  isWechatInstalled, 
  loginWithWechat,
} from '../api/wechatReal';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { setUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isWechatReady, setIsWechatReady] = useState(false);
  const [isWechatInstalled, setIsWechatInstalled] = useState(false);

  useEffect(() => {
    initWechatSDK();
  }, []);

  const initWechatSDK = async () => {
    const initialized = await initWechat();
    setIsWechatReady(initialized);
    
    const installed = await isWechatInstalled();
    setIsWechatInstalled(installed);
  };

  const handleWechatLogin = async () => {
    if (!isWechatInstalled) {
      Alert.alert('提示', '请先安装微信客户端');
      return;
    }

    setIsLoading(true);
    try {
      // 调用真正的微信登录
      const result = await loginWithWechat();
      
      if (result.success && result.userInfo) {
        const userInfo = {
          id: result.userInfo.openid,
          nickname: result.userInfo.nickname,
          avatar: result.userInfo.avatar,
          phone: undefined,
          isVip: false,
          vipExpireTime: undefined,
          createdAt: Date.now(),
        };

        setUser(userInfo);
        Alert.alert('登录成功 🎉', `欢迎回来，${userInfo.nickname}`, [
          { text: '确定', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('登录失败', result.error || '请重试');
      }
    } catch (error) {
      console.error('登录错误:', error);
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
            style={[
              styles.wechatButton,
              (!isWechatReady || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleWechatLogin}
            disabled={!isWechatReady || isLoading}
          >
            <View style={styles.wechatIconContainer}>
              <Ionicons name="chatbubble" size={24} color="#07C160" />
            </View>
            {isLoading ? (
              <ActivityIndicator color="#07C160" style={styles.loadingIndicator} />
            ) : (
              <Text style={styles.wechatButtonText}>
                {isWechatInstalled ? '微信一键登录' : '请安装微信'}
              </Text>
            )}
          </TouchableOpacity>

          {/* 分割线 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或者</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 游客登录 */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestLogin}
          >
            <Text style={styles.guestButtonText}>游客模式</Text>
          </TouchableOpacity>
        </View>

        {/* 底部协议 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            登录即表示同意
            <Text style={styles.footerLink}>《用户协议》</Text>
            和
            <Text style={styles.footerLink}>《隐私政策》</Text>
          </Text>
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
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
    color: palette.primary,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  appSlogan: {
    ...typography.body2,
    color: palette.textSecondary,
  },
  loginSection: {
    marginTop: spacing.xl,
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
    color: palette.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  wechatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  wechatIconContainer: {
    marginRight: spacing.sm,
  },
  wechatButtonText: {
    ...typography.body1,
    color: '#07C160',
    fontWeight: '600',
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    ...typography.caption,
    color: palette.textLight,
    marginHorizontal: spacing.md,
  },
  guestButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  guestButtonText: {
    ...typography.body1,
    color: palette.textSecondary,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: palette.textLight,
    textAlign: 'center',
  },
  footerLink: {
    color: palette.primary,
  },
});

export default LoginScreen;
