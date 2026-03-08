# 微信登录与支付集成指南

## 概述

本文档说明如何在 Expo 项目中集成微信登录和支付功能。

## 方案选择

### 方案A：H5/WebBrowser 方案（推荐，当前实现）
- ✅ 无需 Eject Expo
- ✅ Expo Go 可直接测试
- ⚠️ H5 支付体验略逊于原生

### 方案B：EAS Build + 原生模块
- ✅ 原生体验最好
- ❌ 需要 Eject Expo
- ❌ 无法在 Expo Go 测试

---

## 当前实现：H5 方案

### 1. 配置文件

编辑 `src/config/wechat.ts`：

```typescript
export const WECHAT_CONFIG = {
  // 微信开放平台申请的 AppID
  APP_ID: 'wx1234567890abcdef',
  
  // 微信支付商户号
  MCH_ID: '1234567890',
  
  // API v3 密钥
  API_KEY: 'your_api_key_here',
  
  // 后端 API 地址
  BACKEND_URL: 'https://your-api-server.com',
};
```

### 2. 微信开放平台配置

1. 注册微信开放平台账号：https://open.weixin.qq.com
2. 创建移动应用，获取 AppID
3. 配置应用签名（Android）和 Bundle ID（iOS）
4. 申请微信支付权限（需要企业资质）

### 3. 后端需要实现的接口

#### 3.1 获取微信授权 URL
```http
POST /wechat/auth-url
Content-Type: application/json

{
  "redirectUri": "https://your-app.expo.app/--/wechat-callback"
}

Response:
{
  "authUrl": "https://open.weixin.qq.com/connect/oauth2/authorize?..."
}
```

#### 3.2 获取用户信息
```http
POST /wechat/user-info
Content-Type: application/json

{
  "code": "auth_code_from_wechat"
}

Response:
{
  "openid": "user_openid",
  "nickname": "微信昵称",
  "avatar": "https://...",
  "unionid": "unionid_optional"
}
```

#### 3.3 创建支付订单
```http
POST /wechat/create-order
Content-Type: application/json

{
  "userId": "user_id",
  "type": "vip_month",
  "amount": 2990,
  "description": "月度会员",
  "notifyUrl": "https://your-api-server.com/wechat/notify"
}

Response:
{
  "orderId": "ORDER20240308123456",
  "prepayId": "wx202403081234567890",
  "payParams": {
    "appId": "wx...",
    "timeStamp": "1709900000",
    "nonceStr": "random_string",
    "package": "prepay_id=wx...",
    "signType": "RSA",
    "paySign": "signature"
  }
}
```

#### 3.4 查询订单状态
```http
GET /wechat/order-status?orderId=ORDER20240308123456

Response:
{
  "orderId": "ORDER20240308123456",
  "status": "paid",  // pending | paid | failed
  "paidAt": "2024-03-08T12:34:56Z"
}
```

#### 3.5 支付结果通知（微信回调）
```http
POST /wechat/notify
Content-Type: application/xml

<xml>
  <appid><![CDATA[wx...]]></appid>
  <mch_id><![CDATA[123...]]></mch_id>
  <out_trade_no><![CDATA[ORDER...]]></out_trade_no>
  <result_code><![CDATA[SUCCESS]]></result_code>
  ...
</xml>
```

---

## 后端实现示例（Node.js）

```javascript
// 微信登录授权
app.post('/wechat/auth-url', (req, res) => {
  const { redirectUri } = req.body;
  const state = generateRandomString(16);
  
  const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?` +
    `appid=${WECHAT_APPID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=snsapi_userinfo` +  // 或 snsapi_base（仅获取openid）
    `&state=${state}` +
    `#wechat_redirect`;
  
  res.json({ authUrl });
});

// 获取用户信息
app.post('/wechat/user-info', async (req, res) => {
  const { code } = req.body;
  
  // 1. 用 code 换 access_token
  const tokenRes = await fetch(
    `https://api.weixin.qq.com/sns/oauth2/access_token?` +
    `appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&code=${code}&grant_type=authorization_code`
  );
  const tokenData = await tokenRes.json();
  
  // 2. 用 access_token 获取用户信息
  const userRes = await fetch(
    `https://api.weixin.qq.com/sns/userinfo?` +
    `access_token=${tokenData.access_token}&openid=${tokenData.openid}`
  );
  const userData = await userRes.json();
  
  res.json({
    openid: userData.openid,
    nickname: userData.nickname,
    avatar: userData.headimgurl,
    unionid: userData.unionid,
  });
});

// 创建支付订单
app.post('/wechat/create-order', async (req, res) => {
  const { userId, type, amount, description, notifyUrl } = req.body;
  
  const orderId = `ORDER${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
  
  // 调用微信统一下单 API
  const params = {
    appid: WECHAT_APPID,
    mch_id: WECHAT_MCH_ID,
    nonce_str: generateNonceStr(),
    body: description,
    out_trade_no: orderId,
    total_fee: amount,  // 单位：分
    spbill_create_ip: req.ip,
    notify_url: notifyUrl,
    trade_type: 'APP',  // 或 'MWEB' (H5)
  };
  
  // 签名
  params.sign = generateSignature(params, WECHAT_API_KEY);
  
  // 调用微信 API
  const wxRes = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
    method: 'POST',
    body: buildXML(params),
  });
  
  const wxData = await parseXML(await wxRes.text());
  
  if (wxData.return_code !== 'SUCCESS') {
    return res.status(500).json({ error: wxData.return_msg });
  }
  
  // 生成前端调起支付的参数
  const payParams = {
    appId: WECHAT_APPID,
    timeStamp: String(Math.floor(Date.now() / 1000)),
    nonceStr: generateNonceStr(),
    package: `prepay_id=${wxData.prepay_id}`,
    signType: 'RSA',  // 或 'MD5'（旧版）
  };
  
  // RSA 签名
  payParams.paySign = generateRSASignature(payParams);
  
  res.json({
    orderId,
    prepayId: wxData.prepay_id,
    payParams,
  });
});
```

---

## 切换到真实 API

### 1. 修改配置文件
编辑 `src/config/wechat.ts`，填入真实的微信配置。

### 2. 部署后端服务
确保后端实现了上述所有接口。

### 3. 测试
```bash
cd mobile-native
npm start
```

在 Expo Go 中测试：
1. 点击"微信登录"，应跳转微信授权页
2. 授权后返回 App，完成登录
3. 进入 VIP 页面，选择套餐支付

---

## 常见问题

### Q: 开发模式下为什么是模拟数据？
A: 真实微信支付需要：
- 企业资质（个体户也可以）
- 微信认证（300元/年）
- 备案域名
- 后端服务器

模拟数据用于前端开发和 UI 测试。

### Q: 如何接入真实微信支付？
A: 需要：
1. 注册微信支付商户号
2. 申请 API 证书
3. 配置支付目录和授权域名
4. 实现后端签名逻辑
5. 修改 `WECHAT_CONFIG` 配置

### Q: iOS 审核会被拒吗？
A: 注意：
- 必须提供"游客模式"或"其他登录方式"
- 虚拟商品必须使用苹果内购（IAP）
- 实物商品可以使用微信支付

建议将 VIP 会员改为"积分充值"或"实物赠品"模式。

---

## 下一步：EAS Build 方案（可选）

如需最佳体验，可以使用 EAS Build + `react-native-wechat-lib`：

```bash
# 1. 安装依赖
npm install react-native-wechat-lib

# 2. 配置 app.json
{
  "expo": {
    "plugins": [
      "react-native-wechat-lib"
    ]
  }
}

# 3. 构建原生应用
npx eas build --platform android
npx eas build --platform ios
```

注意：此方案无法在 Expo Go 中测试，需要安装自定义开发客户端或构建独立应用。
