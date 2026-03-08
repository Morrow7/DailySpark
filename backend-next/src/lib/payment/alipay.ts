
import { IPaymentProvider, PaymentOrder, PaymentResult } from './types';

export class AlipayProvider implements IPaymentProvider {
  async createOrder(order: PaymentOrder): Promise<PaymentResult> {
    console.log('Creating Alipay Order:', order);
    
    // Simulate Alipay SDK (alipay.trade.page.pay)
    const gateway = 'https://openapi-sandbox.dl.alipaydev.com/gateway.do';
    const params = new URLSearchParams({
      app_id: 'mock_app_id',
      method: 'alipay.trade.page.pay',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString(),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: order.orderId,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        total_amount: order.amount.toFixed(2),
        subject: order.subject,
        body: order.description
      })
    });

    return {
      success: true,
      transactionId: `ali_${Date.now()}`,
      payload: {
        payUrl: `${gateway}?${params.toString()}`
      }
    };
  }

  verifySignature(params: any): boolean {
    return true; // Mock verification
  }

  async refund(orderId: string, amount: number): Promise<PaymentResult> {
    console.log(`Refunding Alipay Order ${orderId}: ${amount}`);
    return { success: true };
  }
}
