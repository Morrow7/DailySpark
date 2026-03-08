import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

const WECHAT_APP_ID = Constants.expoConfig?.extra?.wechatAppId || 'YOUR_WECHAT_APP_ID';
const WECHAT_APP_SECRET = Constants.expoConfig?.extra?.wechatAppSecret || 'YOUR_WECHAT_APP_SECRET';

// 微信用户信息
export interface WechatUserInfo {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid: string;
}

// 微信登录响应
export interface WechatLoginResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
}

/**
 * 检查是否支持微信登录
 */
export function isWechatLoginSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * 使用Expo AuthSession进行微信登录
 * 注意：需要在微信开放平台注册应用并配置回调地址
 */
export async function loginWithWechat(): Promise<WechatLoginResponse | null> {
  try {
    // 构建微信OAuth授权URL
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'com.dailyspark.mobilenative',
    });

    const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?` +
      `appid=${WECHAT_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=snsapi_userinfo` +
      `&state=STATE#wechat_redirect`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const { queryParams } = Linking.parse(result.url);
      const code = queryParams?.code;

      if (code) {
        const codeStr = Array.isArray(code) ? code[0] : code;
        // 使用code换取access_token
        return await exchangeCodeForToken(codeStr);
      }
    }

    return null;
  } catch (error) {
    console.error('微信登录失败:', error);
    throw error;
  }
}

/**
 * 使用code换取access_token
 */
async function exchangeCodeForToken(code: string): Promise<WechatLoginResponse> {
  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?` +
    `appid=${WECHAT_APP_ID}` +
    `&secret=${WECHAT_APP_SECRET}` +
    `&code=${code}` +
    `&grant_type=authorization_code`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`微信登录错误: ${data.errmsg}`);
  }

  return data;
}

/**
 * 获取微信用户信息
 */
export async function getWechatUserInfo(
  accessToken: string,
  openid: string
): Promise<WechatUserInfo> {
  const url = `https://api.weixin.qq.com/sns/userinfo?` +
    `access_token=${accessToken}` +
    `&openid=${openid}` +
    `&lang=zh_CN`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`获取用户信息失败: ${data.errmsg}`);
  }

  return data;
}

/**
 * 刷新微信access_token
 */
export async function refreshWechatToken(refreshToken: string): Promise<WechatLoginResponse> {
  const url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?` +
    `appid=${WECHAT_APP_ID}` +
    `&grant_type=refresh_token` +
    `&refresh_token=${refreshToken}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`刷新token失败: ${data.errmsg}`);
  }

  return data;
}

/**
 * 检查微信access_token是否有效
 */
export async function checkWechatToken(
  accessToken: string,
  openid: string
): Promise<boolean> {
  const url = `https://api.weixin.qq.com/sns/auth?` +
    `access_token=${accessToken}` +
    `&openid=${openid}`;

  const response = await fetch(url);
  const data = await response.json();

  return data.errcode === 0;
}

// 模拟微信登录（用于开发测试）
export async function mockWechatLogin(): Promise<WechatLoginResponse & { userInfo: WechatUserInfo }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        access_token: 'mock_access_token_' + Date.now(),
        expires_in: 7200,
        refresh_token: 'mock_refresh_token_' + Date.now(),
        openid: 'mock_openid_' + Date.now(),
        scope: 'snsapi_userinfo',
        unionid: 'mock_unionid_' + Date.now(),
        userInfo: {
          openid: 'mock_openid_' + Date.now(),
          nickname: '微信用户' + Math.floor(Math.random() * 10000),
          sex: 1,
          province: '北京',
          city: '北京',
          country: '中国',
          headimgurl: 'https://via.placeholder.com/100',
          privilege: [],
          unionid: 'mock_unionid_' + Date.now(),
        },
      });
    }, 1000);
  });
}
