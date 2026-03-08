import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { palette, typography } from '../theme';
import type { RootStackNavigationProp } from '../navigation/types';

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('SplashScreen: 启动页加载');
    
    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // 2秒后跳转到主页面
    const timer = setTimeout(() => {
      console.log('SplashScreen: 准备跳转到主页面');
      try {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          console.log('SplashScreen: 执行导航跳转');
          navigation.replace('MainTabs');
        });
      } catch (error) {
        console.error('SplashScreen: 跳转失败', error);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[palette.primary, palette.primaryLight, palette.grass]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo图标 */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ translateY: bounceAnim }] },
          ]}
        >
          <View style={styles.logoBackground}>
            <Ionicons name="leaf" size={80} color={palette.cloud} />
          </View>
        </Animated.View>

        {/* 应用名称 */}
        <Text style={styles.appName}>每日英语</Text>
        <Text style={styles.appSlogan}>让学习成为一种习惯</Text>

        {/* 装饰元素 */}
        <View style={styles.decorations}>
          <Animated.View style={[styles.cloud, styles.cloud1]}>
            <Ionicons name="cloud" size={50} color="rgba(255,255,255,0.3)" />
          </Animated.View>
          <Animated.View style={[styles.cloud, styles.cloud2]}>
            <Ionicons name="cloud" size={35} color="rgba(255,255,255,0.2)" />
          </Animated.View>
          <Animated.View style={[styles.cloud, styles.cloud3]}>
            <Ionicons name="cloud" size={40} color="rgba(255,255,255,0.25)" />
          </Animated.View>
        </View>

        {/* 底部装饰草 */}
        <View style={styles.grassContainer}>
          {[...Array(12)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.grassBlade,
                {
                  height: 30 + Math.random() * 20,
                  left: `${i * 8 + Math.random() * 5}%`,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* 版本号 */}
      <Text style={styles.version}>v1.0.0</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  appName: {
    ...typography.h1,
    color: palette.cloud,
    fontWeight: '800',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSlogan: {
    ...typography.body1,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
  },
  decorations: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  cloud: {
    position: 'absolute',
  },
  cloud1: {
    top: height * 0.15,
    right: width * 0.1,
  },
  cloud2: {
    top: height * 0.25,
    left: width * 0.08,
  },
  cloud3: {
    top: height * 0.6,
    right: width * 0.15,
  },
  grassContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
  },
  grassBlade: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(124,179,66,0.6)',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    transform: [{ rotate: `${Math.random() * 10 - 5}deg` }],
  },
  version: {
    position: 'absolute',
    bottom: 40,
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default SplashScreen;
