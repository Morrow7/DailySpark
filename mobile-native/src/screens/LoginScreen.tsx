import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/types';
import { authApi, API_URL } from '../services/api';
import { palette, spacing, radius } from '../theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      if (response.error) {
        Alert.alert('Login Failed', response.error);
      } else {
        await AsyncStorage.setItem('user_token', response.token);
        await AsyncStorage.setItem('user_info', JSON.stringify(response.user));
        navigation.replace('MainTabs');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeChatLogin = async () => {
    // In a real production app, you MUST integrate `react-native-wechat-lib`.
    // Example flow:
    // 1. WeChat.registerApp(APP_ID, universalLink);
    // 2. WeChat.sendAuthRequest({ scope: 'snsapi_userinfo', state: '...' });
    // 3. Receive code from callback.
    // 4. Send code to backend.

    setLoading(true);
    try {
      // 1. GET CODE
      // For DEMO purposes, we simulate getting a code. 
      // In development, we can use a mock code to test the backend flow.
      let code = '';
      
      if (__DEV__) {
        // Mock code for testing
        code = 'mock_wechat_code_' + Date.now();
        console.log('Dev Mode: Using mock WeChat code:', code);
        
        // Optional: In real dev with physical device, you might want to try calling real WeChat if configured
        // const isWeChatInstalled = await WeChat.isWXAppInstalled();
      } else {
        Alert.alert('Configuration Error', 'WeChat SDK not configured for production build.');
        setLoading(false);
        return;
      }

      // 2. SEND TO BACKEND
      const response = await fetch(`${API_URL}/auth/wechat`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ code })
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'WeChat login failed');
      }

      // 3. HANDLE SUCCESS
      await AsyncStorage.setItem('user_token', data.token);
      await AsyncStorage.setItem('user_info', JSON.stringify(data.user));
      navigation.replace('MainTabs');

    } catch (error: any) {
      console.error('WeChat Login Error', error);
      Alert.alert('Login Failed', error.message || 'Could not login with WeChat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email / Phone</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email or phone"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.wechatButton]}
          onPress={handleWeChatLogin}
        >
          <Text style={styles.buttonText}>Login with WeChat</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: palette.primary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.l,
  },
  label: {
    fontSize: 16,
    color: palette.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: palette.card,
    borderRadius: radius.m,
    padding: spacing.m,
    fontSize: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  button: {
    backgroundColor: palette.primary,
    padding: spacing.m,
    borderRadius: radius.m,
    alignItems: 'center',
    marginTop: spacing.l,
  },
  wechatButton: {
    backgroundColor: '#07C160', // WeChat Green
    marginTop: spacing.m,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  link: {
    color: palette.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
