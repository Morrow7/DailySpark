import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

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

// 支付状态
export type PayStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

// 支付进度回调
export interface PayProgress {
  status: PayStatus;
  message: string;
  progress?: number;
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
  const order: WechatPayOrder = {
    body: productName,
    outTradeNo: generateOrderNo(),
    totalFee: Math.round(amount * 100), // 转换为分
    spbillCreateIp: '127.0.0.1',
    notifyUrl: 'https://your-domain.com/api/wechat/notify',
    tradeType: Platform.OS === 'ios' || Platform.OS === 'android' ? 'APP' : 'JSAPI',
    openid,
  };

  return await mockCreateOrder(order);
}

/**
 * 发起微信支付 - 带进度回调
 */
export async function requestWechatPayment(
  payParams: WechatPayResponse,
  onProgress?: (progress: PayProgress) => void
): Promise<PayResult> {
  try {
    onProgress?.({ status: 'PENDING', message: '正在调起微信支付...', progress: 20 });
    
    // 模拟调起微信支付
    await delay(800);
    
    onProgress?.({ status: 'PENDING', message: '等待用户确认支付...', progress: 50 });
    
    if (Platform.OS === 'web') {
      return await mockWebPayment(payParams, onProgress);
    } else {
      return await mockAppPayment(payParams, onProgress);
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
 * 处理VIP会员充值 - 完整支付流程
 */
export async function processVipPayment(
  planId: string,
  planName: string,
  price: number,
  openid?: string,
  onProgress?: (progress: PayProgress) => void
): Promise<PayResult> {
  try {
    onProgress?.({ status: 'PENDING', message: '正在创建订单...', progress: 10 });
    
    // 1. 创建支付订单
    const payParams = await createWechatPayOrder(
      planId,
      `VIP会员 - ${planName}`,
      price,
      openid
    );

    onProgress?.({ status: 'PENDING', message: '订单创建成功', progress: 30 });

    // 2. 发起支付
    const result = await requestWechatPayment(payParams, onProgress);

    if (result.success) {
      onProgress?.({ status: 'SUCCESS', message: '支付成功！', progress: 100 });
    } else {
      onProgress?.({ status: 'FAILED', message: result.errMsg || '支付失败', progress: 0 });
    }

    return result;
  } catch (error) {
    console.error('VIP充值失败:', error);
    onProgress?.({ status: 'FAILED', message: '支付过程中出现错误', progress: 0 });
    return {
      success: false,
      errCode: -1,
      errMsg: error instanceof Error ? error.message : '充值失败',
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
  return await mockRefund(outTradeNo, refundNo, totalFee, refundFee, reason);
}

// ==================== 模拟实现 ====================

// 生成订单号
function generateOrderNo(): string {
  const date = new Date();
  const timestamp = date.getTime().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WX${timestamp}${random}`;
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟创建订单
async function mockCreateOrder(order: WechatPayOrder): Promise<WechatPayResponse> {
  await delay(500);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = Math.random().toString(36).substring(2, 15);
  
  return {
    appid: WECHAT_APP_ID,
    partnerid: 'mock_partner_id',
    prepayid: 'mock_prepay_id_' + Date.now(),
    package: 'Sign=WXPay',
    noncestr: nonceStr,
    timestamp: timestamp,
    sign: 'mock_sign_' + Date.now(),
  };
}

// 模拟APP支付
async function mockAppPayment(
  payParams: WechatPayResponse,
  onProgress?: (progress: PayProgress) => void
): Promise<PayResult> {
  // 模拟支付确认弹窗延迟
  await delay(1500);
  
  // 模拟用户确认支付
  onProgress?.({ status: 'PENDING', message: '正在处理支付...', progress: 70 });
  await delay(1000);
  
  // 90%成功率
  const success = Math.random() > 0.1;
  
  if (success) {
    onProgress?.({ status: 'PENDING', message: '支付成功，正在确认...', progress: 90 });
    await delay(500);
    
    return {
      success: true,
      orderId: payParams.prepayid,
    };
  } else {
    // 模拟取消或失败
    const isCancelled = Math.random() > 0.5;
    
    if (isCancelled) {
      return {
        success: false,
        errCode: -2,
        errMsg: '用户取消支付',
      };
    } else {
      return {
        success: false,
        errCode: -1,
        errMsg: '支付失败，请重试',
      };
    }
  }
}

// 模拟Web支付
async function mockWebPayment(
  payParams: WechatPayResponse,
  onProgress?: (progress: PayProgress) => void
): Promise<PayResult> {
  await delay(1500);
  onProgress?.({ status: 'PENDING', message: '正在处理支付...', progress: 70 });
  await delay(1000);
  
  const success = Math.random() > 0.1;
  
  if (success) {
    onProgress?.({ status: 'PENDING', message: '支付成功，正在确认...', progress: 90 });
    await delay(500);
    
    return {
      success: true,
      orderId: payParams.prepayid,
    };
  } else {
    const isCancelled = Math.random() > 0.5;
    
    return {
      success: false,
      errCode: isCancelled ? -2 : -1,
      errMsg: isCancelled ? '用户取消支付' : '支付失败，请重试',
    };
  }
}

// 模拟查询订单
async function mockQueryOrder(outTradeNo: string): Promise<{
  success: boolean;
  status: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'PAYERROR';
  message?: string;
}> {
  await delay(500);
  return {
    success: true,
    status: 'SUCCESS',
    message: '支付成功',
  };
}

// 模拟退款
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
  await delay(500);
  return {
    success: true,
    refundId: 'REFUND_' + Date.now(),
    message: '退款申请已提交',
  };
}
