// 自然清新的配色方案
export const palette = {
  // 主色调 - 森林绿
  primary: '#2D5016',
  primaryLight: '#4A7C2E',
  primaryDark: '#1A3009',

  // 辅助色 - 天空蓝
  secondary: '#87CEEB',
  secondaryLight: '#B0E0E6',
  secondaryDark: '#4682B4',

  // 强调色 - 阳光黄
  accent: '#F4D03F',
  accentLight: '#F9E79F',
  accentDark: '#D4AC0D',

  // 自然色
  grass: '#7CB342',
  grassLight: '#AED581',
  grassDark: '#558B2F',

  sky: '#E3F2FD',
  cloud: '#FFFFFF',
  earth: '#8D6E63',

  // 文字颜色
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  textWhite: '#FFFFFF',

  // 背景色
  background: '#F5F9F0',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // 状态色
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // 边框和分割线
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // 兼容性颜色
  lightBlue: '#E3F2FD',
  danger: '#F44336',
  text: '#1A1A1A',
  shadow: 'rgba(0,0,0,0.1)',
  inputBg: '#F5F5F5',

  // VIP金色
  vipGold: '#FFD700',
  vipGoldLight: '#FFF8DC',
  vipGoldDark: '#DAA520',
};

// 字体大小
export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 28, fontWeight: '700' as const },
  h3: { fontSize: 24, fontWeight: '600' as const },
  h4: { fontSize: 20, fontWeight: '600' as const },
  h5: { fontSize: 18, fontWeight: '600' as const },
  body1: { fontSize: 16, fontWeight: '400' as const },
  body2: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
};

// 间距
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 圆角
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

// 别名兼容
export const radius = borderRadius;

// 阴影
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// 动画时长
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};
