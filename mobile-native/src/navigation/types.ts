import { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Vip: undefined;
  ArticleDetail: { articleId: string };
  VoiceCall: { contactId?: string; contactName?: string };
  Payment: { amount: number; productName: string; productId: string };
  Login: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Words: undefined;
  Reading: undefined;
  Chat: undefined;
  Mine: undefined;
};

// 导航 Props 类型
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// 扩展全局类型
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
