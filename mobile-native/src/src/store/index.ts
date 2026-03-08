import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 用户信息类型
export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone?: string;
  isVip: boolean;
  vipExpireTime?: number;
  createdAt: number;
}

// 会员套餐类型
export interface VipPlan {
  id: string;
  name: string;
  duration: number; // 天数
  price: number;
  originalPrice: number;
  description: string;
  isHot?: boolean;
}

// 应用状态
interface AppState {
  // 用户信息
  user: UserInfo | null;
  isLoggedIn: boolean;
  setUser: (user: UserInfo | null) => void;
  logout: () => void;
  
  // VIP状态
  checkVipStatus: () => boolean;
  
  // 学习数据
  studyDays: number;
  learnedWords: number;
  readingProgress: number;
  incrementStudyDays: () => void;
  addLearnedWords: (count: number) => void;
  updateReadingProgress: (progress: number) => void;
  
  // 聊天历史
  chatHistory: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  addChatMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  clearChatHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户状态
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      logout: () => set({ user: null, isLoggedIn: false }),
      
      // VIP状态检查
      checkVipStatus: () => {
        const { user } = get();
        if (!user || !user.isVip || !user.vipExpireTime) return false;
        return Date.now() < user.vipExpireTime;
      },
      
      // 学习数据
      studyDays: 0,
      learnedWords: 0,
      readingProgress: 0,
      incrementStudyDays: () => set((state) => ({ studyDays: state.studyDays + 1 })),
      addLearnedWords: (count) => set((state) => ({ learnedWords: state.learnedWords + count })),
      updateReadingProgress: (progress) => set({ readingProgress: progress }),
      
      // 聊天历史
      chatHistory: [],
      addChatMessage: (message) => set((state) => ({
        chatHistory: [
          ...state.chatHistory,
          {
            id: Date.now().toString(),
            ...message,
            timestamp: Date.now(),
          },
        ],
      })),
      clearChatHistory: () => set({ chatHistory: [] }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// VIP套餐数据
export const vipPlans: VipPlan[] = [
  {
    id: 'vip_month',
    name: '月度会员',
    duration: 30,
    price: 28,
    originalPrice: 38,
    description: '解锁所有基础功能',
  },
  {
    id: 'vip_quarter',
    name: '季度会员',
    duration: 90,
    price: 68,
    originalPrice: 98,
    description: '日均仅需0.76元',
    isHot: true,
  },
  {
    id: 'vip_year',
    name: '年度会员',
    duration: 365,
    price: 198,
    originalPrice: 298,
    description: '最划算的选择',
  },
];
