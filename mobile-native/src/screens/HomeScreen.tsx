import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { RealisticRabbit } from '../components/RealisticRabbit';

const { width, height } = Dimensions.get('window');

// Cloud Component
const Cloud = ({ x, y, scale = 1, speed = 10000 }: { x: number, y: number, scale?: number, speed?: number }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(20, { duration: speed, easing: Easing.inOut(Easing.quad) }),
        withTiming(-20, { duration: speed, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale }],
  }));

  return (
    <Animated.View style={[styles.cloudContainer, { left: x, top: y }, animatedStyle]}>
      <Svg width="100" height="60" viewBox="0 0 100 60">
        <Circle cx="30" cy="30" r="25" fill="white" opacity="0.8" />
        <Circle cx="50" cy="25" r="28" fill="white" opacity="0.9" />
        <Circle cx="70" cy="30" r="25" fill="white" opacity="0.8" />
      </Svg>
    </Animated.View>
  );
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Sky */}
      <LinearGradient
        colors={['#87CEEB', '#E0F7FA']}
        style={styles.sky}
      />

      {/* Clouds */}
      <Cloud x={50} y={80} scale={1.2} speed={8000} />
      <Cloud x={width - 100} y={150} scale={0.8} speed={12000} />
      <Cloud x={width / 2} y={50} scale={1.0} speed={10000} />

      {/* Grass */}
      <View style={styles.groundContainer}>
        <LinearGradient
          colors={['#90EE90', '#4CAF50']}
          style={styles.ground}
        />
        {/* Decorative Grass Blades */}
        <Svg height="50" width={width} style={styles.grassBlades}>
           {Array.from({ length: 20 }).map((_, i) => (
             <Circle
               key={i}
               cx={i * (width / 20) + 10}
               cy={40}
               r={20}
               fill="#4CAF50"
               opacity="0.8"
             />
           ))}
        </Svg>
      </View>

      {/* Rabbit */}
      <View style={styles.rabbitWrapper}>
        <RealisticRabbit scale={1.2} />
      </View>

      {/* Interactive Trigger */}
      <View style={styles.interactionArea} onTouchEnd={() => {
        // You could expose a ref from RealisticRabbit to trigger specific animations
        // like a jump or a surprised look on tap
      }} />

      {/* Welcome Text */}
      <View style={styles.welcomeBox}>
        <Text style={styles.welcomeText}>Good Morning!</Text>
        <Text style={styles.subText}>Ready to learn some new words?</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sky: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cloudContainer: {
    position: 'absolute',
  },
  groundContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '35%',
  },
  ground: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  grassBlades: {
    position: 'absolute',
    top: -20,
  },
  rabbitWrapper: {
    position: 'absolute',
    bottom: '15%',
    alignSelf: 'center',
    zIndex: 10,
  },
  interactionArea: {
    position: 'absolute',
    bottom: '15%',
    alignSelf: 'center',
    width: 150,
    height: 200,
    zIndex: 20,
    // backgroundColor: 'rgba(255,0,0,0.1)', // debug
  },
  welcomeBox: {
    position: 'absolute',
    top: '15%',
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
    opacity: 0.9,
  },
});
