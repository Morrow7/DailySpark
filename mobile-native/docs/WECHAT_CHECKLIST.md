# 微信集成快速检查清单

## 当前状态
✅ 前端代码已完成（开发模式可用）
⬜ 需要配置真实 API

## 接入步骤

### 第一步：微信开放平台（1-3天）
- [ ] 注册微信开放平台账号
- [ ] 企业认证（300元/年）
- [ ] 创建移动应用，获取 AppID
- [ ] 申请微信支付（需要企业资质）
- [ ] 配置应用签名和 Bundle ID

### 第二步：后端开发（2-5天）
- [ ] 部署后端服务器
- [ ] 实现 `/wechat/auth-url` 接口
- [ ] 实现 `/wechat/user-info` 接口
- [ ] 实现 `/wechat/create-order` 接口
- [ ] 实现 `/wechat/order-status` 接口
- [ ] 实现 `/wechat/notify` 回调接口
- [ ] 配置微信支付证书和密钥

### 第三步：前端配置（10分钟）
- [ ] 编辑 `src/config/wechat.ts`
- [ ] 填入真实 AppID
- [ ] 填入真实后端地址
- [ ] 测试登录和支付

### 第四步：发布准备（1-2天）
- [ ] iOS：配置 Universal Links
- [ ] Android：配置应用签名
- [ ] 测试真机支付流程
- [ ] 提交应用商店审核

## 当前可用的功能

### 开发模式（模拟数据）
- ✅ 微信登录 UI 流程
- ✅ VIP 支付 UI 流程
- ✅ 用户信息存储
- ✅ 会员状态管理

### 生产环境（需配置后）
- ⬜ 真实微信授权登录
- ⬜ 真实微信支付
- ⬜ 支付结果通知

## 文件结构

```
mobile-native/src/
├── config/
│   └── wechat.ts          # 微信配置（需修改）
├── services/
│   └── wechat.ts          # 微信服务（已完成）
├── screens/
│   ├── MineScreen.tsx     # 微信登录入口
│   └── VipScreen.tsx      # 微信支付入口
└── docs/
    ├── wechat-integration.md   # 详细文档
    └── WECHAT_CHECKLIST.md     # 本文件
```

## 联系方式

微信开放平台：https://open.weixin.qq.com
微信支付商户平台：https://pay.weixin.qq.com

## 注意事项

1. **iOS 审核**：虚拟商品需使用苹果内购，建议将 VIP 改为"积分充值"模式
2. **Android 签名**：发布时需要使用正式签名，与微信配置一致
3. **HTTPS**：所有后端接口必须使用 HTTPS
4. **域名备案**：中国大陆服务器需要备案域名
