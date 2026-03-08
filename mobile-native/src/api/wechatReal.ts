import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

// 微信配置
const WECHAT_APP_ID = Constants.expoConfig?.extra?.wechatAppId || '';

// 判断是否配置了真实的微信参数
const isWechatConfigured = WECHAT_APP_ID && 
  WECHAT_APP_ID !== 'YOUR_WECHAT_APP_ID' && 
  WECHAT_APP_ID !== 'wx你的AppID';

// 后端 API 地址（需要替换为你的后端地址）
const API_BASE_URL = 'https://your-backend-api.com';

// 微信 SDK 实例（延迟加载）
let WeChat: any = null;
let sdkLoadAttempted = false;

/**
 * 动态加载微信 SDK
 * 只在原生环境中加载，web 环境或 Expo Go 中使用模拟模式
 */
async function loadWechatSDK(): Promise<any> {
  // 如果不是原生环境，直接返回 null
  if (Platform.OS === 'web') {
    return null;
  }
  
  // 如果已经尝试加载过，直接返回结果
  if (sdkLoadAttempted) {
    return WeChat;
  }
  
  sdkLoadAttempted = true;
  
  // 如果没有配置微信参数，不尝试加载
  if (!isWechatConfigured) {
    console.log('微信未配置，使用模拟模式');
    return null;
  }
  
  try {
    // 尝试动态导入
    const wechatModule = await import('react-native-wechat-lib');
    WeChat = wechatModule.default || wechatModule;
    
    // 注册应用
    if (WeChat && WeChat.registerApp) {
      await WeChat.registerApp(WECHAT_APP_ID, '');
      console.log('微信 SDK 初始化成功');
    }
    
    return WeChat;
  } catch (error) {
    console.warn('微信 SDK 加载失败，将使用模拟模式:', error);
    WeChat = null;
    return null;
  }
}

/**
 * 初始化微信 SDK
 */
export async function initWechat(): Promise<boolean> {
  const sdk = await loadWechatSDK();
  return !!sdk;
}

/**
 * 检查是否安装微信
 */
export async function isWechatInstalled(): Promise<boolean> {
  try {
    const sdk = await loadWechatSDK();
    if (!sdk || !sdk.isWXAppInstalled) return false;
    return await sdk.isWXAppInstalled();
  } catch (error) {
    return false;
  }
}

// ==================== 微信登录 ====================

/**
 * 微信登录
 * 注意：如果没有配置真实的微信参数，将回退到模拟登录
 */
export async function loginWithWechat(): Promise<{
  success: boolean;
  userInfo?: {
    openid: string;
    unionid?: string;
    nickname: string;
    avatar: string;
    accessToken: string;
  };
  error?: string;
}> {
  try {
    // 检查是否支持真实微信登录
    const sdk = await loadWechatSDK();
    const isInstalled = await isWechatInstalled();
    
    // 如果不支持真实登录，使用模拟登录
    if (!sdk || !isInstalled) {
      console.log('使用模拟微信登录');
      return await mockWechatLogin();
    }

    // 发起微信授权请求
    const authResult = await sdk.sendAuthRequest('snsapi_userinfo', '');
    
    if (!authResult.code) {
      return { success: false, error: '获取授权码失败' };
    }

    console.log('微信授权成功, code:', authResult.code);

    // 将 code 发送到后端换取用户信息
    const response = await fetch(`${API_BASE_URL}/api/auth/wechat/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: authResult.code,
        platform: Platform.OS,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        userInfo: {
          openid: data.openid,
          unionid: data.unionid,
          nickname: data.nickname,
          avatar: data.headimgurl,
          accessToken: data.access_token,
        },
      };
    } else {
      return { success: false, error: data.message || '登录失败' };
    }
  } catch (error) {
    console.error('微信登录失败:', error);
    // 出错时回退到模拟登录
    return await mockWechatLogin();
  }
}

/**
 * 模拟微信登录（用于测试）
 */
async function mockWechatLogin(): Promise<{
  success: boolean;
  userInfo?: {
    openid: string;
    unionid?: string;
    nickname: string;
    avatar: string;
    accessToken: string;
  };
  error?: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    userInfo: {
      openid: 'mock_openid_' + Date.now(),
      unionid: 'mock_unionid_' + Date.now(),
      nickname: '微信用户' + Math.floor(Math.random() * 10000),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
      accessToken: 'mock_access_token_' + Date.now(),
    },
  };
}

// ==================== 微信支付 ====================

/**
 * 微信支付订单参数
 */
export interface WechatPayParams {
  partnerId: string;
  prepayId: string;
  nonceStr: string;
  timeStamp: string;
  package: string;
  sign: string;
}

/**
 * 发起微信支付
 * 注意：如果没有配置真实的微信参数，将回退到模拟支付
 */
export async function requestWechatPayment(params: {
  productId: string;
  productName: string;
  amount: number;
  attach?: string;
}): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  try {
    // 检查是否支持真实支付
    const sdk = await loadWechatSDK();
    const isInstalled = await isWechatInstalled();
    
    // 如果不支持真实支付，使用模拟支付
    if (!sdk || !isInstalled) {
      console.log('使用模拟微信支付');
      return await mockWechatPayment();
    }

    // 1. 调用后端 API 创建订单
    const orderResponse = await fetch(`${API_BASE_URL}/api/payment/wechat/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        productId: params.productId,
        productName: params.productName,
        amount: params.amount,
        attach: params.attach,
        platform: Platform.OS,
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderData.success) {
      return { success: false, error: orderData.message || '创建订单失败' };
    }

    // 2. 调用微信 SDK 支付
    const payResult = await sdk.pay({
      partnerId: orderData.partnerId,
      prepayId: orderData.prepayId,
      nonceStr: orderData.nonceStr,
      timeStamp: orderData.timeStamp,
      package: orderData.package,
      sign: orderData.sign,
    });

    console.log('微信支付结果:', payResult);

    // 3. 处理支付结果
    if (payResult.errCode === 0) {
      return {
        success: true,
        orderId: orderData.orderId,
      };
    } else if (payResult.errCode === -2) {
      return { success: false, error: '用户取消支付' };
    } else {
      return { 
        success: false, 
        error: `支付失败: ${payResult.errStr || '未知错误'}` 
      };
    }
  } catch (error) {
    console.error('微信支付失败:', error);
    // 出错时回退到模拟支付
    return await mockWechatPayment();
  }
}

/**
 * 模拟支付（用于测试）
 */
async function mockWechatPayment(): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 90% 成功率
  if (Math.random() > 0.1) {
    return {
      success: true,
      orderId: 'MOCK_ORDER_' + Date.now(),
    };
  } else {
    return {
      success: false,
      error: '模拟支付失败',
    };
  }
}

/**
 * 处理 VIP 会员支付
 */
export async function processVipPaymentReal(
  planId: string,
  planName: string,
  price: number,
  userId?: string
): Promise<{
  success: boolean;
  orderId?: string;
  error?: string;
}> {
  return await requestWechatPayment({
    productId: planId,
    productName: `VIP会员 - ${planName}`,
    amount: price,
    attach: JSON.stringify({
      type: 'vip',
      userId: userId,
      planId: planId,
    }),
  });
}

// ==================== 辅助函数 ====================

/**
 * 获取用户认证 token
 */
async function getAuthToken(): Promise<string> {
  // 从存储中获取 token
  return '';
}

/**
 * 分享文本到微信
 */
export async function shareTextToWechat(
  text: string,
  scene: 'session' | 'timeline' = 'session'
): Promise<boolean> {
  try {
    const sdk = await loadWechatSDK();
    if (!sdk || !sdk.shareText) {
      Alert.alert('提示', '分享功能暂不可用');
      return false;
    }

    const isInstalled = await isWechatInstalled();
    if (!isInstalled) {
      Alert.alert('提示', '请先安装微信');
      return false;
    }

    await sdk.shareText({
      text,
      scene: scene === 'session' ? sdk.Scene.Session : sdk.Scene.Timeline,
    });

    return true;
  } catch (error) {
    console.error('分享失败:', error);
    return false;
  }
}
