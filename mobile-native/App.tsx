import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from './src/screens/SplashScreen';
import WordsScreen from './src/screens/WordsScreen';
import ReadingScreen from './src/screens/ReadingScreen';
import ChatScreen from './src/screens/ChatScreen';
import MineScreen from './src/screens/MineScreen';
import { palette } from './src/theme';
import type { RootStackParamList } from './src/navigation/types';

import HomeScreen from './src/screens/HomeScreen';
import NatureTabBar from './src/components/NatureTabBar';

import VipScreen from './src/screens/VipScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <NatureTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute' }, // Required for custom floating tab bar
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tabs.Screen name="Words" component={WordsScreen} options={{ title: '单词' }} />
      <Tabs.Screen name="Reading" component={ReadingScreen} options={{ title: '阅读' }} />
      <Tabs.Screen name="Chat" component={ChatScreen} options={{ title: '聊天' }} />
      <Tabs.Screen name="Mine" component={MineScreen} options={{ title: '我的' }} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Vip" component={VipScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
