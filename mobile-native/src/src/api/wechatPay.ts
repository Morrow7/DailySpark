import Constants from 'expo-constants';
import { Platform } from 'react-native';

const WECHAT_APP_ID = Constants.expoConfig?.extra?.wechatAppId || 'YOUR_WECHAT_APP_ID';

// 微信支付订单类型
export interface WechatPayOrder {
  body: string;
  outTradeNo: string;
  totalFee: number; // 单位：分
  spbillCreateIp: string;
  notifyUrl: string;
  tradeType: 'APP' | 'JSAPI' | 'NATIVE';
  openid?: string;
}

// 微信支付响应
export interface WechatPayResponse {
  appid: string;
  partnerid: string;
  prepayid: string;
  package: string;
  noncestr: string;
  timestamp: string;
  sign: string;
}

// 支付结果
export interface PayResult {
  success: boolean;
  errCode?: number;
  errMsg?: string;
  orderId?: string;
}

/**
 * 创建微信支付订单
 * 注意：实际项目中，这部分应该在服务端完成
 */
export async function createWechatPayOrder(
  productId: string,
  productName: string,
  amount: number, // 单位：元
  openid?: string
): Promise<WechatPayResponse> {
  // 在实际项目中，这里应该调用你的后端API
  // 后端会调用微信统一下单接口，然后返回支付参数
  
  const order: WechatPayOrder = {
    body: productName,
    outTradeNo: generateOrderNo(),
    totalFee: Math.round(amount * 100), // 转换为分
    spbillCreateIp: '127.0.0.1',
    notifyUrl: 'https://your-domain.com/api/wechat/notify',
    tradeType: Platform.OS === 'ios' || Platform.OS === 'android' ? 'APP' : 'JSAPI',
    openid,
  };

  // 模拟调用后端API创建订单
  // 实际项目中替换为真实的API调用
  return await mockCreateOrder(order);
}

/**
 * 发起微信支付
 */
export async function requestWechatPayment(
  payParams: WechatPayResponse
): Promise<PayResult> {
  try {
    // 在实际项目中，这里应该调用微信SDK
    // 由于Expo环境限制，这里使用模拟实现
    
    if (Platform.OS === 'web') {
      // Web端使用微信JSAPI支付
      return await mockWebPayment(payParams);
    } else {
      // 移动端使用微信APP支付
      return await mockAppPayment(payParams);
    }
  } catch (error) {
    console.error('微信支付失败:', error);
    return {
      success: false,
      errCode: -1,
      errMsg: error instanceof Error ? error.message : '支付失败',
    };
  }
}

/**
 * 查询订单状态
 */
export async function queryOrderStatus(outTradeNo: string): Promise<{
  success: boolean;
  status: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'PAYERROR';
  message?: string;
}> {
  // 实际项目中调用后端API查询订单状态
  return await mockQueryOrder(outTradeNo);
}

/**
 * 申请退款
 */
export async function requestRefund(
  outTradeNo: string,
  refundNo: string,
  totalFee: number,
  refundFee: number,
  reason?: string
): Promise<{
  success: boolean;
  refundId?: string;
  message?: string;
}> {
  // 实际项目中调用后端API申请退款
  return await mockRefund(outTradeNo, refundNo, totalFee, refundFee, reason);
}

// 生成订单号
function generateOrderNo(): string {
  const date = new Date();
  const timestamp = date.getTime().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WX${timestamp}${random}`;
}

// 模拟创建订单（开发测试用）
async function mockCreateOrder(order: WechatPayOrder): Promise<WechatPayResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const nonceStr = Math.random().toString(36).substring(2, 15);
      
      resolve({
        appid: WECHAT_APP_ID,
        partnerid: 'mock_partner_id',
        prepayid: 'mock_prepay_id_' + Date.now(),
        package: 'Sign=WXPay',
        noncestr: nonceStr,
        timestamp: timestamp,
        sign: 'mock_sign_' + Date.now(),
      });
    }, 500);
  });
}

// 模拟APP支付（开发测试用）
async function mockAppPayment(payParams: WechatPayResponse): Promise<PayResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟支付成功
      const success = Math.random() > 0.2; // 80%成功率
      
      if (success) {
        resolve({
          success: true,
          orderId: payParams.prepayid,
        });
      } else {
        resolve({
          success: false,
          errCode: -2,
          errMsg: '用户取消支付',
        });
      }
    }, 1500);
  });
}

// 模拟Web支付（开发测试用）
async function mockWebPayment(payParams: WechatPayResponse): Promise<PayResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        resolve({
          success: true,
          orderId: payParams.prepayid,
        });
      } else {
        resolve({
          success: false,
          errCode: -2,
          errMsg: '用户取消支付',
        });
      }
    }, 1500);
  });
}

// 模拟查询订单（开发测试用）
async function mockQueryOrder(outTradeNo: string): Promise<{
  success: boolean;
  status: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'PAYERROR';
  message?: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        status: 'SUCCESS',
        message: '支付成功',
      });
    }, 500);
  });
}

// 模拟退款（开发测试用）
async function mockRefund(
  outTradeNo: string,
  refundNo: string,
  totalFee: number,
  refundFee: number,
  reason?: string
): Promise<{
  success: boolean;
  refundId?: string;
  message?: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        refundId: 'REFUND_' + Date.now(),
        message: '退款申请已提交',
      });
    }, 500);
  });
}

/**
 * 处理VIP会员充值
 */
export async function processVipPayment(
  planId: string,
  planName: string,
  price: number,
  openid?: string
): Promise<PayResult> {
  try {
    // 1. 创建支付订单
    const payParams = await createWechatPayOrder(
      planId,
      `VIP会员 - ${planName}`,
      price,
      openid
    );

    // 2. 发起支付
    const result = await requestWechatPayment(payParams);

    // 3. 如果支付成功，更新用户VIP状态
    if (result.success) {
      // 这里应该调用后端API更新用户VIP状态
      console.log('VIP充值成功:', planId);
    }

    return result;
  } catch (error) {
    console.error('VIP充值失败:', error);
    return {
      success: false,
      errCode: -1,
      errMsg: error instanceof Error ? error.message : '充值失败',
    };
  }
}
