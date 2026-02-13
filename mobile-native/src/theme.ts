export const palette = {
  // Cute Rabbit Theme - Pastel Colors
  primary: '#FF9EB5',    // Soft Pink (Sakura)
  secondary: '#88D1E3',  // Sky Blue
  accent: '#FFD166',     // Soft Yellow
  background: '#FFF0F5', // Lavender Blush (Very light pink bg)
  card: '#FFFFFF',
  text: '#4A4E69',       // Dark Lavender Grey (Softer than black)
  textLight: '#9A8C98',  // Muted Purple Grey
  border: '#F2E9E4',     // Pale Dogwood
  inputBg: '#FFF',

  // Functional
  success: '#95D5B2',    // Mint Green
  warning: '#FFB5A7',    // Peach
  danger: '#F28482',     // Soft Red
  lightBlue: '#E0F4F9',  // Very light blue for active states

  // Shadows
  shadow: 'rgba(255, 158, 181, 0.3)', // Pink shadow

  // Semantic
  get activeTab() { return this.primary },
  get inactiveTab() { return this.textLight },
  get headerBg() { return this.background },
  get headerText() { return this.text },
};

export const spacing = {
  xs: 6,
  s: 10,
  m: 18,
  l: 26,
  xl: 36,
};

export const radius = {
  s: 12,
  m: 20,
  l: 28,
  xl: 36,
};
