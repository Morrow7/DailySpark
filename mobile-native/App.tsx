import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

// 导入屏幕组件
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import WordsScreen from './src/screens/WordsScreen';
import ReadingScreen from './src/screens/ReadingScreen';
import ArticleDetailScreen from './src/screens/ArticleDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import MineScreen from './src/screens/MineScreen';
import VipScreen from './src/screens/VipScreen';
import LoginScreen from './src/screens/LoginScreen';
import LittlePrinceScreen from './src/screens/LittlePrinceScreen';
import ChapterDetailScreen from './src/screens/ChapterDetailScreen';

// 导入自定义组件
import NatureTabBar from './src/components/NatureTabBar';

// 导入类型定义
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

// 主标签页导航
function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <NatureTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute' },
      }}
    >
      <Tabs.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: '首页' }} 
      />
      <Tabs.Screen 
        name="Words" 
        component={WordsScreen} 
        options={{ title: '单词' }} 
      />
      <Tabs.Screen 
        name="Reading" 
        component={ReadingScreen} 
        options={{ title: '阅读' }} 
      />
      <Tabs.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: '聊天' }} 
      />
      <Tabs.Screen 
        name="Mine" 
        component={MineScreen} 
        options={{ title: '我的' }} 
      />
    </Tabs.Navigator>
  );
}

// 主应用组件
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* 启动页 */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
        />
        
        {/* 主标签页 */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
        />
        
        {/* 文章详情页 */}
        <Stack.Screen 
          name="ArticleDetail" 
          component={ArticleDetailScreen}
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        
        {/* VIP会员页面 */}
        <Stack.Screen 
          name="Vip" 
          component={VipScreen} 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }} 
        />
        
        {/* 登录页面 */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }} 
        />
        
        {/* 小王子书籍页面 */}
        <Stack.Screen 
          name="LittlePrince" 
          component={LittlePrinceScreen}
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
        
        {/* 章节详情页面 */}
        <Stack.Screen 
          name="ChapterDetail" 
          component={ChapterDetailScreen}
          options={{ 
            animation: 'slide_from_right',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
