
import { IPaymentProvider } from './types';
import { WeChatPayProvider } from './wechat';
import { AlipayProvider } from './alipay';

export type PaymentMethod = 'wechat' | 'alipay';

export class PaymentService {
  static getProvider(method: PaymentMethod): IPaymentProvider {
    switch (method) {
      case 'wechat':
        return new WeChatPayProvider();
      case 'alipay':
        return new AlipayProvider();
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }
  }
}
