// API 导出文件

// 微信相关（真实版本）
export {
  initWechat,
  isWechatInstalled,
  loginWithWechat,
  requestWechatPayment,
  processVipPaymentReal,
  shareTextToWechat,
  shareImageToWechat,
} from './wechatReal';

// 微信相关（模拟版本 - 用于测试）
export {
  mockWechatLogin,
} from './wechat';

// 豆包 AI
export {
  sendChatMessage,
  textToSpeech,
  createVoiceConversation,
} from './doubao';

// 微信支付（模拟版本 - 用于测试）
export {
  createWechatPayOrder,
  requestWechatPayment as mockRequestWechatPayment,
  queryOrderStatus,
  processVipPayment,
} from './wechatPay';
