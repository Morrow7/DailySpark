
import { IPaymentProvider, PaymentOrder, PaymentResult } from './types';

export class WeChatPayProvider implements IPaymentProvider {
  // Mock implementation for demo/sandbox
  async createOrder(order: PaymentOrder): Promise<PaymentResult> {
    console.log('Creating WeChat Pay Order:', order);
    
    // Simulate Wechat Pay V3 Prepay
    // In production, this would call https://api.mch.weixin.qq.com/v3/pay/transactions/native
    
    return {
      success: true,
      transactionId: `wx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      payload: {
        code_url: `weixin://wxpay/bizpayurl?pr=mock_code_url_${order.orderId}`, // Mock QR Code URL
        prepay_id: `mock_prepay_id_${order.orderId}`
      }
    };
  }

  verifySignature(params: any): boolean {
    // Implement signature verification (SHA256-RSA2048)
    return true; // Always true for mock
  }

  async refund(orderId: string, amount: number): Promise<PaymentResult> {
    console.log(`Refunding WeChat Order ${orderId}: ${amount}`);
    return {
      success: true,
      message: 'Refund requested'
    };
  }
}
