import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';
import { palette } from '../theme';

const { width, height } = Dimensions.get('window');

// A cute rabbit face shape
const RabbitFace = ({ x, y, scale = 1, opacity = 0.1, color = palette.primary }: any) => (
  <Svg style={{ position: 'absolute', left: x, top: y, transform: [{ scale }] }} height="100" width="100" viewBox="0 0 100 100">
    {/* Ears */}
    <Ellipse cx="35" cy="25" rx="10" ry="25" fill={color} opacity={opacity} />
    <Ellipse cx="65" cy="25" rx="10" ry="25" fill={color} opacity={opacity} />
    {/* Face */}
    <Circle cx="50" cy="60" r="30" fill={color} opacity={opacity} />
    {/* Cheeks */}
    <Circle cx="35" cy="65" r="5" fill="#fff" opacity={opacity * 1.5} />
    <Circle cx="65" cy="65" r="5" fill="#fff" opacity={opacity * 1.5} />
  </Svg>
);

// Floating bubbles/carrots
const Bubble = ({ x, y, r, color }: any) => (
  <View
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      backgroundColor: color,
      opacity: 0.2,
    }}
  />
);

export const RabbitBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.container}>
      {/* Background Layer */}
      <View style={styles.bgLayer} pointerEvents="none">
        {/* Gradient-like circles */}
        <Bubble x={-50} y={-50} r={150} color={palette.secondary} />
        <Bubble x={width - 100} y={height / 3} r={80} color={palette.accent} />
        <Bubble x={-20} y={height - 150} r={100} color={palette.primary} />

        {/* Rabbits */}
        <RabbitFace x={30} y={100} scale={0.8} />
        <RabbitFace x={width - 80} y={50} scale={0.6} color={palette.secondary} />
        <RabbitFace x={50} y={height / 2} scale={1.2} opacity={0.05} />
        <RabbitFace x={width - 120} y={height - 100} scale={0.9} color={palette.accent} />
      </View>
      
      {/* Content Layer */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
