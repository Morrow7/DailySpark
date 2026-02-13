import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackParamList } from '../navigation/types';
import { palette, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>DailySpark</Text>
        <Text style={styles.brandSub}>Start Your Learning Journey</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Vocab & Reading</Text>
        <Text style={styles.desc}>Master English with AI-powered tools.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.replace('MainTabs')}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.primary, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 48 },
  brand: { fontSize: 42, fontWeight: '800', color: '#fff' },
  brandSub: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  card: { backgroundColor: palette.card, borderRadius: 24, padding: 32 },
  title: { fontSize: 24, fontWeight: '700', color: palette.text, marginBottom: 8 },
  desc: { color: palette.textLight, lineHeight: 24, fontSize: 16, marginBottom: 24 },
  primaryBtn: { backgroundColor: palette.secondary, borderRadius: 16, paddingVertical: 16 },
  primaryBtnText: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '700' },
});
