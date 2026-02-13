import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../theme';

const { width } = Dimensions.get('window');

export default function NatureTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {/* Wood Texture Background */}
      <View style={styles.woodPlank}>
        <View style={styles.woodGrain} />
      </View>

      <View style={styles.tabs}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

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

          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = isFocused ? 'home' : 'home-outline';
          else if (route.name === 'Words') iconName = isFocused ? 'book' : 'book-outline';
          else if (route.name === 'Reading') iconName = isFocused ? 'newspaper' : 'newspaper-outline';
          else if (route.name === 'Chat') iconName = isFocused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Mine') iconName = isFocused ? 'person' : 'person-outline';

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  color={isFocused ? '#8B4513' : '#FFF8DC'} 
                />
              </View>
              <Text style={[styles.label, isFocused && styles.activeLabel]}>
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  woodPlank: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#8B4513', // SaddleBrown
    borderWidth: 2,
    borderColor: '#A0522D',
    borderRadius: 35,
  },
  woodGrain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#A0522D',
    opacity: 0.3,
    transform: [{ rotate: '2deg' }],
    width: '120%',
    left: '-10%',
  },
  tabs: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: '#FFF8DC', // Cornsilk
  },
  label: {
    fontSize: 10,
    color: '#DEB887', // Burlywood
    fontWeight: '600',
    marginTop: 2,
  },
  activeLabel: {
    color: '#FFF8DC',
    fontWeight: '800',
  },
});
