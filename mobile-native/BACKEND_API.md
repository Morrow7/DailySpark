# 微信支付和登录后端 API 文档

## 概述

本文档描述了接入真正微信支付和微信登录所需的后端 API 接口。

## 前提条件

1. 在微信开放平台注册移动应用，获取：
   - AppID
   - AppSecret

2. 在微信支付商户平台注册，获取：
   - 商户号 (mch_id)
   - API 密钥 (api_key)
   - 证书文件

3. 配置服务器：
   - 域名需要备案
   - 配置 HTTPS
   - 配置微信支付回调地址

---

## 微信登录接口

### 1. 微信登录

**接口地址：** `POST /api/auth/wechat/login`

**请求参数：**
```json
{
  "code": "微信授权码",
  "platform": "ios|android"
}
```

**响应数据：**
```json
{
  "success": true,
  "openid": "用户唯一标识",
  "unionid": "unionid（可选）",
  "nickname": "微信昵称",
  "headimgurl": "头像URL",
  "access_token": "访问令牌",
  "refresh_token": "刷新令牌",
  "expires_in": 7200
}
```

**实现流程：**
1. 使用 code 换取 access_token 和 openid
   ```
   GET https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
   ```

2. 使用 access_token 获取用户信息
   ```
   GET https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID
   ```

3. 保存或更新用户数据到数据库
4. 生成应用自身的 JWT token

---

## 微信支付接口

### 1. 创建支付订单

**接口地址：** `POST /api/payment/wechat/create-order`

**请求头：**
```
Authorization: Bearer {JWT_TOKEN}
```

**请求参数：**
```json
{
  "productId": "商品ID",
  "productName": "商品名称",
  "amount": 28.00,
  "attach": "附加数据（JSON字符串）",
  "platform": "ios|android"
}
```

**响应数据：**
```json
{
  "success": true,
  "orderId": "订单号",
  "partnerId": "商户号",
  "prepayId": "预支付交易会话ID",
  "nonceStr": "随机字符串",
  "timeStamp": "时间戳",
  "package": "Sign=WXPay",
  "sign": "签名"
}
```

**实现流程：**
1. 生成内部订单号
2. 调用微信统一下单 API
3. 生成二次签名供移动端调用
4. 返回支付参数

**统一下单请求：**
```xml
<xml>
  <appid>APPID</appid>
  <mch_id>MCH_ID</mch_id>
  <nonce_str>随机字符串</nonce_str>
  <body>商品描述</body>
  <out_trade_no>订单号</out_trade_no>
  <total_fee>金额（分）</total_fee>
  <spbill_create_ip>用户IP</spbill_create_ip>
  <notify_url>回调地址</notify_url>
  <trade_type>APP</trade_type>
  <sign>签名</sign>
</xml>
```

### 2. 查询订单状态

**接口地址：** `POST /api/payment/wechat/query-order`

**请求头：**
```
Authorization: Bearer {JWT_TOKEN}
```

**请求参数：**
```json
{
  "orderId": "订单号"
}
```

**响应数据：**
```json
{
  "success": true,
  "orderId": "订单号",
  "status": "SUCCESS|NOTPAY|CLOSED|REFUND",
  "amount": 2800,
  "paidTime": "2024-01-01T12:00:00Z"
}
```

### 3. 支付回调通知

**接口地址：** `POST /api/payment/wechat/notify`

**请求方式：** 微信支付服务器主动推送

**处理流程：**
1. 验证签名
2. 处理业务逻辑（开通VIP等）
3. 返回成功响应

**响应数据：**
```xml
<xml>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <return_msg><![CDATA[OK]]></return_msg>
</xml>
```

---

## 数据库表设计

### 用户表 (users)
```sql
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  openid VARCHAR(64) UNIQUE NOT NULL,
  unionid VARCHAR(64),
  nickname VARCHAR(128),
  avatar VARCHAR(512),
  is_vip BOOLEAN DEFAULT FALSE,
  vip_expire_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 订单表 (orders)
```sql
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  product_name VARCHAR(256),
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'PAID', 'CLOSED', 'REFUNDED') DEFAULT 'PENDING',
  wechat_order_id VARCHAR(64),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

---

## 安全注意事项

1. **签名验证**：所有微信支付回调必须验证签名
2. **HTTPS**：所有接口必须使用 HTTPS
3. **敏感信息**：AppSecret、API 密钥等不要放在客户端
4. **幂等性**：订单处理需要保证幂等性，防止重复支付
5. **超时处理**：设置合理的订单超时时间

---

## 测试环境

微信支付提供沙箱环境用于测试：
- 沙箱地址：https://api.mch.weixin.qq.com/sandboxnew
- 使用沙箱密钥进行测试

---

## 参考文档

- [微信开放平台](https://open.weixin.qq.com/)
- [微信支付开发文档](https://pay.weixin.qq.com/wiki/doc/api/app/app.php?chapter=9_1)
