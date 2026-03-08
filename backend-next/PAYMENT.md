# Payment System Integration

## Overview
The system supports **WeChat Pay** and **Alipay** for membership recharges.
Currently implemented with **Mock Providers** for development and testing.

## API Endpoints

### 1. Get Membership Plans
`GET /api/plans`
Returns list of active plans.

### 2. Create Payment Order
`POST /api/payment/create`
**Headers**: `Authorization: Bearer <token>`
**Body**:
```json
{
  "planId": 1,
  "method": "wechat" // or "alipay"
}
```
**Response**:
```json
{
  "orderId": "uuid...",
  "code_url": "weixin://..." // For WeChat
  // OR
  "payUrl": "https://..." // For Alipay
}
```

### 3. Payment Notification (Webhook)
`POST /api/payment/notify`
**Body**:
```json
{
  "orderId": "uuid...",
  "status": "success" // or "failed"
}
```
*Note: In production, this will handle XML/Form data and verify signatures.*

## Architecture
- **PaymentService**: Factory to get provider.
- **IPaymentProvider**: Interface for `createOrder`, `verifySignature`, `refund`.
- **Database**:
  - `MembershipPlan`: Product catalog.
  - `Order`: Transaction record.
  - `Payment`: Payment gateway interaction record.
  - `UserMembership`: User's entitlement status.

## Testing
1. Ensure plans are seeded (or create manually via Prisma Studio).
2. Run `npm run test:payment` to simulate the full flow.
