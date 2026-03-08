import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import { palette } from '../theme';

const { width } = Dimensions.get('window');

interface RabbitEatingGrassProps {
  size?: number;
}

// 动画G组件包装器 - 必须在组件使用前定义
const AnimatedG = Animated.createAnimatedComponent(G);

const RabbitEatingGrass: React.FC<RabbitEatingGrassProps> = ({ size = 200 }) => {
  // 动画值
  const rabbitBounce = useRef(new Animated.Value(0)).current;
  const earLeftRotate = useRef(new Animated.Value(0)).current;
  const earRightRotate = useRef(new Animated.Value(0)).current;
  const mouthScale = useRef(new Animated.Value(1)).current;
  const grassSway1 = useRef(new Animated.Value(0)).current;
  const grassSway2 = useRef(new Animated.Value(0)).current;
  const grassSway3 = useRef(new Animated.Value(0)).current;
  const blinkOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 兔子上下轻微跳动
    Animated.loop(
      Animated.sequence([
        Animated.timing(rabbitBounce, {
          toValue: -5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rabbitBounce, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 左耳朵摆动
    Animated.loop(
      Animated.sequence([
        Animated.timing(earLeftRotate, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(earLeftRotate, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 右耳朵摆动
    Animated.loop(
      Animated.sequence([
        Animated.timing(earRightRotate, {
          toValue: 10,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(earRightRotate, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 嘴巴咀嚼动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(mouthScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(mouthScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(mouthScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(mouthScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 草摆动动画
    Animated.loop(
      Animated.stagger(300, [
        Animated.sequence([
          Animated.timing(grassSway1, {
            toValue: 5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(grassSway1, {
            toValue: -5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(grassSway1, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(grassSway2, {
            toValue: -5,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(grassSway2, {
            toValue: 5,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(grassSway2, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(grassSway3, {
            toValue: 5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(grassSway3, {
            toValue: -5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(grassSway3, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 眨眼动画
    Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(blinkOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(blinkOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
      ])
    ).start();
  }, []);

  const scale = size / 200;

  return (
    <View style={[styles.container, { width: size, height: size * 0.8 }]}>
      <Svg width={size} height={size * 0.8} viewBox="0 0 200 160">
        {/* 草地背景 */}
        <Ellipse cx="100" cy="145" rx="90" ry="15" fill={palette.grassLight} opacity="0.5" />
        
        {/* 草丛 - 后层 */}
        <AnimatedG transform={[{ translateX: grassSway3 }]}>
          <Path
            d="M20 140 Q25 110 30 140"
            stroke={palette.grass}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M35 140 Q40 100 45 140"
            stroke={palette.grassDark}
            strokeWidth="3"
            fill="none"
          />
        </AnimatedG>
        
        <AnimatedG transform={[{ translateX: grassSway2 }]}>
          <Path
            d="M160 140 Q165 105 170 140"
            stroke={palette.grass}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M175 140 Q180 95 185 140"
            stroke={palette.grassDark}
            strokeWidth="3"
            fill="none"
          />
        </AnimatedG>

        {/* 兔子身体组 */}
        <AnimatedG transform={[{ translateY: rabbitBounce }]}>
          {/* 身体 */}
          <Ellipse cx="100" cy="110" rx="45" ry="40" fill={palette.cloud} />
          
          {/* 左耳朵 */}
          <AnimatedG 
            transform={[
              { translateX: 75 },
              { translateY: 50 },
              { rotate: earLeftRotate.interpolate({
                inputRange: [-10, 0],
                outputRange: ['-10deg', '0deg'],
              })},
              { translateX: -75 },
              { translateY: -50 },
            ]}
          >
            <Ellipse cx="75" cy="50" rx="12" ry="35" fill={palette.cloud} />
            <Ellipse cx="75" cy="50" rx="6" ry="25" fill="#FFB6C1" />
          </AnimatedG>
          
          {/* 右耳朵 */}
          <AnimatedG 
            transform={[
              { translateX: 125 },
              { translateY: 50 },
              { rotate: earRightRotate.interpolate({
                inputRange: [0, 10],
                outputRange: ['0deg', '10deg'],
              })},
              { translateX: -125 },
              { translateY: -50 },
            ]}
          >
            <Ellipse cx="125" cy="50" rx="12" ry="35" fill={palette.cloud} />
            <Ellipse cx="125" cy="50" rx="6" ry="25" fill="#FFB6C1" />
          </AnimatedG>
          
          {/* 头部 */}
          <Circle cx="100" cy="85" r="38" fill={palette.cloud} />
          
          {/* 眼睛 */}
          <AnimatedG opacity={blinkOpacity}>
            <Circle cx="85" cy="80" r="5" fill={palette.textPrimary} />
            <Circle cx="115" cy="80" r="5" fill={palette.textPrimary} />
            <Circle cx="87" cy="78" r="2" fill={palette.cloud} />
            <Circle cx="117" cy="78" r="2" fill={palette.cloud} />
          </AnimatedG>
          
          {/* 鼻子 */}
          <Ellipse cx="100" cy="92" rx="4" ry="3" fill="#FFB6C1" />
          
          {/* 嘴巴 - 咀嚼动画 */}
          <AnimatedG 
            transform={[
              { translateX: 100 },
              { translateY: 98 },
              { scale: mouthScale },
              { translateX: -100 },
              { translateY: -98 },
            ]}
          >
            <Path
              d="M92 98 Q100 105 108 98"
              stroke={palette.textPrimary}
              strokeWidth="2"
              fill="none"
            />
          </AnimatedG>
          
          {/* 腮红 */}
          <Ellipse cx="75" cy="95" rx="6" ry="4" fill="#FFB6C1" opacity="0.5" />
          <Ellipse cx="125" cy="95" rx="6" ry="4" fill="#FFB6C1" opacity="0.5" />
          
          {/* 前爪 */}
          <Ellipse cx="80" cy="125" rx="10" ry="15" fill={palette.cloud} />
          <Ellipse cx="120" cy="125" rx="10" ry="15" fill={palette.cloud} />
          
          {/* 尾巴 */}
          <Circle cx="145" cy="115" r="12" fill={palette.cloud} />
        </AnimatedG>

        {/* 草丛 - 前层 */}
        <AnimatedG transform={[{ translateX: grassSway1 }]}>
          <Path
            d="M50 145 Q55 115 60 145"
            stroke={palette.grassLight}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M65 145 Q70 110 75 145"
            stroke={palette.grass}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M80 145 Q85 120 90 145"
            stroke={palette.grassDark}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M110 145 Q115 115 120 145"
            stroke={palette.grassLight}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M125 145 Q130 110 135 145"
            stroke={palette.grass}
            strokeWidth="3"
            fill="none"
          />
          <Path
            d="M140 145 Q145 120 150 145"
            stroke={palette.grassDark}
            strokeWidth="3"
            fill="none"
          />
        </AnimatedG>

        {/* 小草叶 */}
        <Path
          d="M95 135 Q100 125 105 135"
          stroke={palette.grass}
          strokeWidth="2"
          fill="none"
        />
        <Path
          d="M98 138 Q100 128 102 138"
          stroke={palette.grassLight}
          strokeWidth="2"
          fill="none"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RabbitEatingGrass;
