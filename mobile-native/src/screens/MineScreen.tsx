import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity, TextInput } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { palette, radius, spacing } from '../theme';
import { authApi, userApi } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

// Mock Data
const weeklyData = [
  { value: 20, label: 'Mon' },
  { value: 45, label: 'Tue' },
  { value: 30, label: 'Wed' },
  { value: 60, label: 'Thu' },
  { value: 40, label: 'Fri' },
  { value: 55, label: 'Sat' },
  { value: 35, label: 'Sun' },
];

const vocabData = [
  { value: 400, color: palette.primary, text: 'CET4' },
  { value: 250, color: palette.secondary, text: 'CET6' },
  { value: 150, color: palette.warning, text: 'IELTS' },
];

import { useNavigation } from '@react-navigation/native';

export default function MineScreen() {
  const navigation = useNavigation<any>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem('user_token');
    if (token) {
      setIsLoggedIn(true);
      fetchProfile();
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await userApi.getProfile();
      if (data && !data.error) {
        setUserInfo(data);
      }
    } catch (err) {
      console.log('Profile fetch error', err);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      let res;
      if (authMode === 'login') {
        res = await authApi.login({ email, password });
      } else {
        res = await authApi.register({ email, password, confirmPassword: password });
      }

      if (res.token) {
        await AsyncStorage.setItem('user_token', res.token);
        setIsLoggedIn(true);
        fetchProfile();
      } else {
        alert(res.error || 'Authentication failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
          <Text style={styles.authSubtitle}>Sign in to track your learning progress</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={palette.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={palette.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {authMode === 'register' && (
              <TextInput
                style={styles.input}
                placeholder="Verification Code"
                placeholderTextColor={palette.textLight}
                keyboardType="number-pad"
              />
            )}

            <TouchableOpacity style={styles.primaryBtn} onPress={handleAuth}>
              <Text style={styles.primaryBtnText}>{authMode === 'login' ? 'Log In' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              <Text style={styles.linkText}>
                {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{userInfo?.nickname || 'My Profile'}</Text>
            <Text style={styles.userEmail}>{userInfo?.email || 'student@example.com'}</Text>
            {userInfo?.vip_expire_date ? (
              <View style={{ marginTop: 4, backgroundColor: palette.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: palette.text }}>VIP Exp: {new Date(userInfo.vip_expire_date).toLocaleDateString()}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={{ marginTop: 6, backgroundColor: palette.text, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }}
                onPress={() => navigation.navigate('Vip')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="diamond" size={12} color="#FFD700" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#fff' }}>Upgrade to PRO</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={async () => {
            await authApi.logout();
            setIsLoggedIn(false);
            setUserInfo(null);
          }}>
            <Ionicons name="log-out-outline" size={24} color={palette.danger} />
          </TouchableOpacity>
        </View>

        {/* Hero Stats */}
        <View style={styles.hero}>
          <View style={styles.heroItem}>
            <Text style={styles.heroValue}>{userInfo?.stats?.streak_days || 0}</Text>
            <Text style={styles.heroLabel}>Day Streak</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.heroItem}>
            <Text style={styles.heroValue}>{userInfo?.stats?.words_learned || 0}</Text>
            <Text style={styles.heroLabel}>Words</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.heroItem}>
            <Text style={styles.heroValue}>{Math.round((userInfo?.stats?.total_duration || 0) / 60)}h</Text>
            <Text style={styles.heroLabel}>Total Time</Text>
          </View>
        </View>

        {/* Learning Trend */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Learning Trend (mins)</Text>
          <LineChart
            data={weeklyData}
            color={palette.primary}
            thickness={3}
            startFillColor={palette.primary}
            endFillColor={palette.primary}
            startOpacity={0.2}
            endOpacity={0.0}
            areaChart
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules
            hideYAxisText
            width={screenWidth - 80}
            height={160}
            spacing={40}
            initialSpacing={10}
          />
        </View>

        {/* Vocab Distribution */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Vocabulary Mastery</Text>
          <View style={styles.pieContainer}>
            <PieChart
              data={vocabData}
              donut
              radius={80}
              innerRadius={50}
              showText
              textColor="#fff"
              textSize={12}
            />
            <View style={styles.legendContainer}>
              {vocabData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBg}>
              <Ionicons name="settings-outline" size={20} color={palette.primary} />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={palette.textLight} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FFF1F2' }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={palette.danger} />
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color={palette.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  content: { padding: spacing.m, paddingBottom: spacing.xl },

  // Auth Styles
  authContainer: { flex: 1, justifyContent: 'center', padding: spacing.l },
  authTitle: { fontSize: 32, fontWeight: '800', color: palette.text, marginBottom: spacing.s },
  authSubtitle: { fontSize: 16, color: palette.textLight, marginBottom: spacing.xl },
  form: { gap: spacing.m },
  input: { backgroundColor: palette.card, borderRadius: radius.m, padding: spacing.m, fontSize: 16, borderWidth: 1, borderColor: palette.border },
  primaryBtn: { backgroundColor: palette.primary, borderRadius: radius.m, padding: spacing.m, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkText: { color: palette.primary, textAlign: 'center', marginTop: spacing.s },

  // Profile Styles
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.l },
  title: { fontSize: 28, fontWeight: '800', color: palette.text },
  userEmail: { fontSize: 14, color: palette.textLight },

  hero: { flexDirection: 'row', backgroundColor: palette.primary, borderRadius: radius.l, padding: spacing.l, marginBottom: spacing.m, justifyContent: 'space-between' },
  heroItem: { alignItems: 'center', flex: 1 },
  heroValue: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  chartCard: { backgroundColor: palette.card, borderRadius: radius.l, padding: spacing.m, marginBottom: spacing.m, overflow: 'hidden' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: palette.text, marginBottom: spacing.m },

  pieContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  legendContainer: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { color: palette.textLight, fontSize: 14 },

  menuCard: { backgroundColor: palette.card, borderRadius: radius.l, padding: spacing.s },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.m },
  menuIconBg: { width: 36, height: 36, borderRadius: 18, backgroundColor: palette.inputBg, alignItems: 'center', justifyContent: 'center', marginRight: spacing.m },
  menuText: { flex: 1, fontSize: 16, color: palette.text, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: palette.border, marginLeft: 52 },
});
