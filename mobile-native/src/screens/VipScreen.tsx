import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { palette, spacing, radius } from '../theme';
import { vipApi } from '../services/api';

const MOCK_PLANS = [
  { id: 'monthly', name: 'Monthly Pro', price: 9.99, duration: 30, description: 'Remove ads, Unlimited AI Chat' },
  { id: 'yearly', name: 'Yearly Pro', price: 99.99, duration: 365, description: 'Remove ads, Unlimited AI Chat, Priority Support' },
];

export default function VipScreen() {
  const navigation = useNavigation();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await vipApi.getPlans();
      if (Array.isArray(data) && data.length > 0) {
        setPlans(data);
        setSelectedPlanId(data[0].id);
      } else {
        setPlans(MOCK_PLANS); // Fallback if API fails or empty
        setSelectedPlanId(MOCK_PLANS[0].id);
      }
    } catch (err) {
      console.log('Failed to load plans', err);
      setPlans(MOCK_PLANS);
      setSelectedPlanId(MOCK_PLANS[0].id);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlanId) return;
    setPurchasing(true);
    try {
      const res = await vipApi.createOrder(selectedPlanId);
      // In a real app, 'res' would contain payment parameters (e.g., for Alipay SDK)
      // Here we simulate a successful payment flow
      
      console.log('Order created:', res);

      // Simulate payment delay
      setTimeout(() => {
        Alert.alert(
          'Payment Successful', 
          'Welcome to DailySpark VIP! Please restart the app or refresh your profile to see changes.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setPurchasing(false);
      }, 1500);

    } catch (err) {
      Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
      setPurchasing(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Membership</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="diamond" size={64} color="#FFD700" style={styles.heroIcon} />
          <Text style={styles.heroTitle}>Unlock Full Potential</Text>
          <Text style={styles.heroSubtitle}>Get unlimited access to AI Chat, Advanced Stats, and more.</Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Your Plan</Text>

        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} />
        ) : (
          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard, 
                    isSelected && styles.selectedPlanCard
                  ]}
                  onPress={() => setSelectedPlanId(plan.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, isSelected && styles.selectedText]}>{plan.name}</Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color={palette.primary} />}
                  </View>
                  <Text style={[styles.planPrice, isSelected && styles.selectedText]}>
                    ${plan.price} <Text style={styles.planDuration}>/ {plan.duration} days</Text>
                  </Text>
                  <Text style={[styles.planDesc, isSelected && styles.selectedText]}>
                    {plan.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.featuresList}>
          <FeatureItem icon="chatbubbles" text="Unlimited AI Voice Chat" />
          <FeatureItem icon="stats-chart" text="Advanced Learning Analytics" />
          <FeatureItem icon="book" text="Exclusive Reading Content" />
          <FeatureItem icon="cloud-offline" text="Offline Mode (Coming Soon)" />
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.purchaseBtn, purchasing && styles.disabledBtn]} 
          onPress={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.purchaseBtnText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.footerNote}>Recurring billing, cancel anytime.</Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: any, text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconBg}>
        <Ionicons name={icon} size={20} color={palette.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A1B2E' }, // Dark theme for VIP
  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.m },
  backBtn: { padding: spacing.s },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: spacing.s },
  
  content: { padding: spacing.l },
  
  hero: { alignItems: 'center', marginBottom: spacing.xl },
  heroIcon: { marginBottom: spacing.m, shadowColor: '#FFD700', shadowOpacity: 0.5, shadowRadius: 20 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: spacing.s, textAlign: 'center' },
  heroSubtitle: { fontSize: 14, color: '#A0A0B0', textAlign: 'center', paddingHorizontal: spacing.l },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: spacing.m },

  plansContainer: { gap: spacing.m, marginBottom: spacing.xl },
  planCard: { 
    backgroundColor: '#252640', 
    borderRadius: radius.l, 
    padding: spacing.l, 
    borderWidth: 2, 
    borderColor: 'transparent' 
  },
  selectedPlanCard: { 
    borderColor: palette.primary,
    backgroundColor: '#2D2E4D'
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s },
  planName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  planPrice: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: spacing.s },
  planDuration: { fontSize: 14, fontWeight: '400', color: '#A0A0B0' },
  planDesc: { fontSize: 14, color: '#A0A0B0', lineHeight: 20 },
  selectedText: { color: '#fff' }, // Ensure contrast when selected

  featuresList: { gap: spacing.m },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureIconBg: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(255, 158, 181, 0.2)', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: spacing.m
  },
  featureText: { color: '#fff', fontSize: 16 },

  footer: { 
    padding: spacing.l, 
    backgroundColor: '#1A1B2E', 
    borderTopWidth: 1, 
    borderTopColor: '#252640' 
  },
  purchaseBtn: { 
    backgroundColor: palette.primary, 
    paddingVertical: spacing.m, 
    borderRadius: radius.l, 
    alignItems: 'center',
    marginBottom: spacing.s,
    shadowColor: palette.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5
  },
  disabledBtn: { opacity: 0.7 },
  purchaseBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  footerNote: { color: '#666', fontSize: 12, textAlign: 'center' }
});
