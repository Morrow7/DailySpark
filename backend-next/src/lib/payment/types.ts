
export interface PaymentOrder {
  orderId: string;
  amount: number;
  subject: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string; // External ID
  payload?: any; // SDK/API response (e.g. payUrl, formHtml)
  message?: string;
}

export interface IPaymentProvider {
  createOrder(order: PaymentOrder): Promise<PaymentResult>;
  verifySignature(params: any): boolean;
  refund(orderId: string, amount: number): Promise<PaymentResult>;
}
