import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { palette, spacing } from '../theme';

const { width } = Dimensions.get('window');

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const tabs: TabItem[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', label: '首页' },
  { name: 'Words', icon: 'book-outline', activeIcon: 'book', label: '单词' },
  { name: 'Reading', icon: 'newspaper-outline', activeIcon: 'newspaper', label: '阅读' },
  { name: 'Chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble', label: '聊天' },
  { name: 'Mine', icon: 'person-outline', activeIcon: 'person', label: '我的' },
];

const NatureTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const tabWidth = (width - 32) / tabs.length;

  return (
    <View style={styles.container}>
      {/* 背景装饰 */}
      <View style={styles.background}>
        <View style={styles.grassDecoration} />
      </View>
      
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const animatedStyle = useAnimatedStyle(() => {
            const scale = withSpring(isFocused ? 1.1 : 1, {
              damping: 15,
              stiffness: 150,
            });
            
            const translateY = withSpring(isFocused ? -8 : 0, {
              damping: 15,
              stiffness: 150,
            });

            return {
              transform: [{ scale }, { translateY }],
            };
          });

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={[styles.tabItem, { width: tabWidth }]}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.iconContainer, animatedStyle]}>
                <Ionicons
                  name={isFocused ? tab.activeIcon : tab.icon}
                  size={isFocused ? 28 : 24}
                  color={isFocused ? palette.primary : palette.textLight}
                />
                {isFocused && (
                  <View style={styles.activeIndicator}>
                    <View style={styles.leafDot} />
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  grassDecoration: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: palette.surface,
    borderRadius: 24,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.grass,
  },
  leafDot: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: palette.grass,
  },
});

export default NatureTabBar;
