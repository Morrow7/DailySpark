// 微信开放平台配置
// 需要先在 https://open.weixin.qq.com 注册应用

export const WECHAT_CONFIG = {
  // 微信开放平台申请的 AppID
  // 注意：需要配置 Universal Links 或自定义 URL Scheme
  APP_ID: 'wx your_app_id_here',
  
  // 商户号（微信支付用）
  MCH_ID: 'your_mch_id_here',
  
  // API 密钥
  API_KEY: 'your_api_key_here',
  
  // 后端 API 地址（处理支付签名等敏感操作）
  BACKEND_URL: 'https://your-backend.com',
};

// 支付类型
export enum PaymentType {
  VIP_MONTH = 'vip_month',
  VIP_QUARTER = 'vip_quarter', 
  VIP_YEAR = 'vip_year',
}

// 支付金额（单位：分）
export const PAYMENT_AMOUNTS: Record<PaymentType, number> = {
  [PaymentType.VIP_MONTH]: 2990,    // 29.9元
  [PaymentType.VIP_QUARTER]: 7990,  // 79.9元
  [PaymentType.VIP_YEAR]: 29900,    // 299元
};

// 获取支付描述
export const getPaymentDesc = (type: PaymentType): string => {
  const descs: Record<PaymentType, string> = {
    [PaymentType.VIP_MONTH]: '月度会员',
    [PaymentType.VIP_QUARTER]: '季度会员',
    [PaymentType.VIP_YEAR]: '年度会员',
  };
  return descs[type];
};
