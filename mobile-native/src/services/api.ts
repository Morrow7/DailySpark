import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEV_API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000/api' 
  : 'http://localhost:3000/api';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEV_API_URL;

const getHeaders = async (token?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    const savedToken = await AsyncStorage.getItem('user_token');
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken}`;
    }
  }
  return headers;
};

export const authApi = {
  login: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  register: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  logout: async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_info');
  },
  resetPassword: async (data: any) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }
};

export const chatApi = {
  sendMessage: async (messages: any[], type: 'text' | 'voice' = 'text') => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages, type }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      // Propagate error with code/message
      const error: any = new Error(data.message || 'Chat failed');
      error.status = res.status;
      error.code = data.code;
      throw error;
    }
    
    return data;
  }
};

export const userApi = {
  getProfile: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/user/profile`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },
  checkin: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/user/checkin`, {
      method: 'POST',
      headers,
    });
    return res.json();
  }
};

export const vipApi = {
  getPlans: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/vip/plans`, {
      headers,
    });
    return res.json();
  },
  createOrder: async (planId: string) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/vip/create_order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ plan_id: planId }),
    });
    return res.json();
  }
};

export const articleApi = {
  getArticles: async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/articles`, {
      headers,
    });
    return res.json();
  },
  getArticle: async (id: number) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/articles/${id}`, {
      headers,
    });
    return res.json();
  }
};
