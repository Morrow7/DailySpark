import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';

// --- Animation Configuration ---
export const RABBIT_CONFIG = {
  blinkInterval: 4000,
  blinkDuration: 150,
  earSwayDuration: 2000,
  eatCycleDuration: 6000, // Total cycle: Idle -> Down -> Chew -> Up
  chewSpeed: 150,
  headBobRange: 5,
};

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

export const RealisticRabbit = ({ scale = 1 }: { scale?: number }) => {
  // --- Shared Values ---
  const headY = useSharedValue(0);
  const headRotate = useSharedValue(0);
  const jawY = useSharedValue(0);
  const earLeftRotate = useSharedValue(-5);
  const earRightRotate = useSharedValue(5);
  const eyeScaleY = useSharedValue(1); // For blinking
  const bodyScaleY = useSharedValue(1); // Breathing

  const jumpY = useSharedValue(0);

  // --- Animation Logic ---

  useEffect(() => {
    // 0. Jump Logic (Exposed trigger)
    // For now, we'll just add a random jump occasionally
    const randomJump = () => {
      jumpY.value = withSequence(
        withTiming(-50, { duration: 300, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.bounce })
      );
      setTimeout(randomJump, Math.random() * 5000 + 5000);
    };
    setTimeout(randomJump, 3000);

    // 1. Blinking Loop
    const blink = () => {
      eyeScaleY.value = withSequence(
        withTiming(0.1, { duration: RABBIT_CONFIG.blinkDuration / 2 }),
        withTiming(1, { duration: RABBIT_CONFIG.blinkDuration / 2 }),
        withDelay(
          Math.random() * 2000 + 2000, // Random delay 2-4s
          withTiming(1, { duration: 0 }, (finished) => {
            if (finished) runOnJS(blink)();
          })
        )
      );
    };
    blink();

    // 2. Ear Sway (Independent slight movement)
    earLeftRotate.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    earRightRotate.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // 3. Breathing (Body Scale)
    bodyScaleY.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // 4. Eating Cycle (Complex Sequence)
    // Idle (Head Up) -> Head Down -> Chew x N -> Head Up
    const runEatCycle = () => {
      // Step 1: Head Down
      headY.value = withTiming(15, { duration: 500, easing: Easing.out(Easing.quad) });
      headRotate.value = withTiming(10, { duration: 500 });

      // Step 2: Start Chewing (after head is down)
      setTimeout(() => {
        jawY.value = withRepeat(
          withSequence(
            withTiming(3, { duration: RABBIT_CONFIG.chewSpeed }),
            withTiming(0, { duration: RABBIT_CONFIG.chewSpeed })
          ),
          10, // Chew 10 times
          true,
          (finished) => {
            if (finished) {
              // Step 3: Head Up
              headY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
              headRotate.value = withTiming(0, { duration: 600 });
              
              // Restart cycle after delay
              runOnJS(scheduleNextEat)();
            }
          }
        );
      }, 600);
    };

    const scheduleNextEat = () => {
      setTimeout(runEatCycle, Math.random() * 2000 + 1000);
    };

    runEatCycle();

    return () => {
      cancelAnimation(headY);
      cancelAnimation(jawY);
      cancelAnimation(earLeftRotate);
      cancelAnimation(eyeScaleY);
    };
  }, []);

  // --- Styles ---
  const headAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: headY.value },
      { rotate: `${headRotate.value}deg` }
    ],
  }));

  const jawAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: jawY.value }],
  }));

  const earLeftStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${earLeftRotate.value}deg` }],
    originY: 40, originX: 35, // Pivot point at base of ear
  }));

  const earRightStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${earRightRotate.value}deg` }],
    originY: 40, originX: 85,
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeScaleY.value }],
    originY: 85, // Pivot at eye center vertically
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: bodyScaleY.value }],
    originY: 150, // Pivot at bottom
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale },
      { translateY: jumpY.value }
    ]
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Svg width="120" height="160" viewBox="0 0 120 160">
        {/* Body */}
        <AnimatedG style={bodyStyle}>
           <Ellipse cx="60" cy="130" rx="45" ry="35" fill="white" stroke="#E6E6E6" strokeWidth="2" />
           <Ellipse cx="60" cy="130" rx="25" ry="20" fill="#FFF5F7" opacity="0.5" />
        </AnimatedG>

        {/* Head Group */}
        <AnimatedG style={headAnimatedStyle}>
          {/* Ears */}
          <AnimatedG style={earLeftStyle}>
            <Ellipse cx="35" cy="40" rx="10" ry="35" fill="#FFF0F5" stroke="#E6E6E6" strokeWidth="2" />
            <Ellipse cx="35" cy="40" rx="6" ry="25" fill="#FFB6C1" opacity="0.4" />
          </AnimatedG>
          
          <AnimatedG style={earRightStyle}>
            <Ellipse cx="85" cy="40" rx="10" ry="35" fill="#FFF0F5" stroke="#E6E6E6" strokeWidth="2" />
            <Ellipse cx="85" cy="40" rx="6" ry="25" fill="#FFB6C1" opacity="0.4" />
          </AnimatedG>
          
          {/* Head Base */}
          <Circle cx="60" cy="90" r="40" fill="white" stroke="#E6E6E6" strokeWidth="2" />
          
          {/* Eyes (Blinking) */}
          <AnimatedG style={eyeStyle}>
            <Circle cx="45" cy="85" r="4" fill="#333" />
            <Circle cx="75" cy="85" r="4" fill="#333" />
            {/* Highlights */}
            <Circle cx="47" cy="83" r="1.5" fill="white" />
            <Circle cx="77" cy="83" r="1.5" fill="white" />
          </AnimatedG>
          
          {/* Blush */}
          <Circle cx="35" cy="95" r="6" fill="#FFB6C1" opacity="0.5" />
          <Circle cx="85" cy="95" r="6" fill="#FFB6C1" opacity="0.5" />

          {/* Snout/Jaw */}
          <AnimatedG style={jawAnimatedStyle}>
             {/* Nose */}
             <Path d="M55 92 Q60 98 65 92" fill="#FFB6C1" stroke="none" />
             
             {/* Mouth */}
             <Path d="M60 98 Q50 105 55 110" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
             <Path d="M60 98 Q70 105 65 110" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
             
             {/* Teeth (Optional, cute detail) */}
             <G transform="translate(0, 2)">
               <Path d="M57 98 L57 102 L60 102 L60 98" fill="white" stroke="#E6E6E6" strokeWidth="0.5" />
               <Path d="M60 98 L60 102 L63 102 L63 98" fill="white" stroke="#E6E6E6" strokeWidth="0.5" />
             </G>
          </AnimatedG>
        </AnimatedG>

        {/* Grass (Only visible when eating, attached to mouth conceptually but simplified here) */}
        {/* We could animate a piece of grass disappearing, but for now let's keep it simple */}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
