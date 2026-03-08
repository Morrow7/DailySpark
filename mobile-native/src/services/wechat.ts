import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';
import { WECHAT_CONFIG, PaymentType, getPaymentDesc, PAYMENT_AMOUNTS } from '../config/wechat';

// 微信登录响应
export interface WechatLoginResult {
  success: boolean;
  code?: string;
  state?: string;
  error?: string;
}

// 微信支付响应
export interface WechatPaymentResult {
  success: boolean;
  prepayId?: string;
  orderId?: string;
  error?: string;
}

// 用户信息
export interface WechatUserInfo {
  openid: string;
  nickname: string;
  avatar: string;
  unionid?: string;
}

/**
 * 微信登录（使用 WebBrowser 打开微信 H5 授权页）
 * 
 * 注意：需要后端配合完成以下流程：
 * 1. 前端请求后端获取微信授权 URL
 * 2. 前端打开 WebBrowser 访问授权 URL
 * 3. 用户授权后微信重定向到后端回调地址
 * 4. 后端获取 code，再调用微信 API 获取 access_token 和用户信息
 * 5. 后端返回用户信息给前端
 */
export async function wechatLogin(): Promise<WechatLoginResult> {
  try {
    // 检查是否在开发模式（模拟登录）
    if (__DEV__) {
      console.log('开发模式：模拟微信登录');
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      return {
        success: true,
        code: 'mock_code_' + Date.now(),
        state: 'mock_state',
      };
    }

    // 生产环境：调用后端获取微信授权 URL
    const response = await fetch(`${WECHAT_CONFIG.BACKEND_URL}/wechat/auth-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      }),
    });

    if (!response.ok) {
      throw new Error('获取授权链接失败');
    }

    const { authUrl } = await response.json();

    // 打开浏览器进行授权
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      AuthSession.makeRedirectUri({ useProxy: true })
    );

    if (result.type === 'success') {
      // 解析返回的 URL 参数
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        return { success: false, error: `授权失败: ${error}` };
      }

      if (code) {
        return { success: true, code, state: state || undefined };
      }
    }

    return { success: false, error: '用户取消授权' };
  } catch (error) {
    console.error('微信登录失败:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * 使用 code 获取用户信息（通过后端）
 */
export async function getWechatUserInfo(code: string): Promise<WechatUserInfo | null> {
  try {
    // 开发模式：返回模拟数据
    if (__DEV__) {
      return {
        openid: 'mock_openid_' + Date.now(),
        nickname: '微信用户' + Math.floor(Math.random() * 1000),
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now(),
        unionid: 'mock_unionid',
      };
    }

    const response = await fetch(`${WECHAT_CONFIG.BACKEND_URL}/wechat/user-info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    return await response.json();
  } catch (error) {
    console.error('获取微信用户信息失败:', error);
    return null;
  }
}

/**
 * 微信支付（H5 支付或 App 支付）
 * 
 * 流程：
 * 1. 前端请求后端创建订单
 * 2. 后端调用微信统一下单 API
 * 3. 后端返回支付参数
 * 4. 前端调起微信支付
 */
export async function wechatPay(
  type: PaymentType,
  userId: string
): Promise<WechatPaymentResult> {
  try {
    // 开发模式：模拟支付
    if (__DEV__) {
      console.log('开发模式：模拟微信支付', { type, amount: PAYMENT_AMOUNTS[type] });
      
      // 模拟支付流程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟 90% 成功率
      if (Math.random() > 0.1) {
        return {
          success: true,
          prepayId: 'mock_prepay_' + Date.now(),
          orderId: 'ORDER' + Date.now(),
        };
      } else {
        return { success: false, error: '模拟支付失败' };
      }
    }

    // 生产环境：调用后端创建订单
    const response = await fetch(`${WECHAT_CONFIG.BACKEND_URL}/wechat/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type,
        amount: PAYMENT_AMOUNTS[type],
        description: getPaymentDesc(type),
        // 支付完成后微信会通知后端，后端再通知前端
        notifyUrl: `${WECHAT_CONFIG.BACKEND_URL}/wechat/notify`,
      }),
    });

    if (!response.ok) {
      throw new Error('创建订单失败');
    }

    const { orderId, prepayId, payParams } = await response.json();

    // 如果是 H5 支付，打开浏览器
    if (payParams.mweb_url) {
      const result = await WebBrowser.openBrowserAsync(payParams.mweb_url);
      
      // 注意：H5 支付无法直接获取支付结果，需要通过轮询后端查询订单状态
      return { success: true, orderId, prepayId };
    }

    // 如果是 App 支付，需要原生模块支持
    // 这里返回参数给原生模块调起微信支付
    return { success: true, orderId, prepayId };
  } catch (error) {
    console.error('微信支付失败:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * 查询订单状态
 */
export async function queryOrderStatus(orderId: string): Promise<{
  success: boolean;
  paid: boolean;
  error?: string;
}> {
  try {
    // 开发模式：模拟查询
    if (__DEV__) {
      return { success: true, paid: true };
    }

    const response = await fetch(`${WECHAT_CONFIG.BACKEND_URL}/wechat/order-status?orderId=${orderId}`);
    
    if (!response.ok) {
      throw new Error('查询订单失败');
    }

    const data = await response.json();
    return { success: true, paid: data.status === 'paid' };
  } catch (error) {
    console.error('查询订单状态失败:', error);
    return { success: false, paid: false, error: String(error) };
  }
}

/**
 * 检查是否安装了微信（需要原生模块，Expo Go 中无法使用）
 */
export function isWechatInstalled(): boolean {
  // Expo Go 中无法检测，返回 true 让流程继续
  if (__DEV__) {
    return true;
  }
  // 生产环境需要通过原生模块检测
  return true;
}

// 开发模式标记声明
declare const __DEV__: boolean;
