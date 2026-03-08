# 每日英语 - React Native 学习应用

一个基于 React Native + Expo 开发的英语学习应用，集成了豆包AI语音对话、微信登录和微信支付会员充值功能。

## 功能特性

### 核心功能
- **首页** - 展示学习统计、快捷入口和每日推荐
- **单词学习** - 分类浏览单词，支持搜索和标记已学
- **阅读训练** - 分级阅读文章，跟踪阅读进度
- **AI语音对话** - 集成豆包API，支持文字和语音聊天
- **个人中心** - 学习记录、收藏、设置等

### 特色动画
- **兔子吃草动画** - 首页可爱的SVG动画，包含：
  - 兔子上下轻微跳动
  - 耳朵自然摆动
  - 嘴巴咀嚼动画
  - 草丛随风摆动
  - 眨眼动画

### 第三方集成
- **豆包API** - AI对话、语音合成(TTS)、语音识别(ASR)
- **微信登录** - 一键微信授权登录
- **微信支付** - VIP会员充值支付

## 项目结构

```
mobile-native/
├── src/
│   ├── api/              # API接口
│   │   ├── doubao.ts     # 豆包API封装
│   │   ├── wechat.ts     # 微信登录
│   │   └── wechatPay.ts  # 微信支付
│   ├── components/       # 组件
│   │   ├── NatureTabBar.tsx      # 自定义底部导航
│   │   └── RabbitEatingGrass.tsx # 兔子吃草动画
│   ├── navigation/       # 导航配置
│   │   └── types.ts      # 类型定义
│   ├── screens/          # 页面
│   │   ├── SplashScreen.tsx  # 启动页
│   │   ├── HomeScreen.tsx    # 首页
│   │   ├── WordsScreen.tsx   # 单词页
│   │   ├── ReadingScreen.tsx # 阅读页
│   │   ├── ChatScreen.tsx    # 聊天页
│   │   ├── MineScreen.tsx    # 我的页面
│   │   ├── VipScreen.tsx     # VIP页面
│   │   └── LoginScreen.tsx   # 登录页
│   ├── store/            # 状态管理
│   │   └── index.ts      # Zustand store
│   ├── theme/            # 主题配置
│   │   └── index.ts      # 颜色、字体、间距等
│   └── assets/           # 资源文件
│       └── animations/   # Lottie动画
├── App.tsx               # 应用入口
├── app.json              # Expo配置
├── package.json          # 依赖配置
└── README.md             # 项目说明
```

## 安装和运行

### 1. 安装依赖

```bash
cd mobile-native
npm install
```

### 2. 配置API密钥

编辑 `app.json` 文件，填入你的API密钥：

```json
{
  "extra": {
    "doubaoApiKey": "YOUR_DOUBAO_API_KEY",
    "doubaoApiUrl": "https://ark.cn-beijing.volces.com/api/v3",
    "wechatAppId": "YOUR_WECHAT_APP_ID",
    "wechatAppSecret": "YOUR_WECHAT_APP_SECRET"
  }
}
```

### 3. 启动开发服务器

```bash
# 启动 Expo 开发服务器
npm start

# 或者
npx expo start
```

### 4. 运行应用

- **iOS**: 按 `i` 键或在 iOS 模拟器运行
- **Android**: 按 `a` 键或在 Android 模拟器运行
- **Web**: 按 `w` 键在浏览器运行

## API配置说明

### 豆包API

1. 访问 [火山引擎](https://www.volcengine.com/) 注册账号
2. 创建应用并获取 API Key
3. 在 `app.json` 中配置 `doubaoApiKey`

支持的模型：
- `doubao-lite-4k` - 轻量级对话模型
- `doubao-pro-4k` - 专业级对话模型

### 微信登录

1. 访问 [微信开放平台](https://open.weixin.qq.com/) 注册开发者账号
2. 创建移动应用，获取 AppID 和 AppSecret
3. 配置应用签名和包名
4. 在 `app.json` 中配置 `wechatAppId` 和 `wechatAppSecret`

### 微信支付

1. 申请 [微信支付商户号](https://pay.weixin.qq.com/)
2. 配置支付回调地址
3. 在后端实现统一下单接口（生产环境必需）

## 开发模式说明

### 模拟数据

当前代码中包含模拟数据/模拟API调用，方便开发和测试：
- `mockWechatLogin()` - 模拟微信登录
- `mockCreateOrder()` - 模拟创建支付订单
- `mockTranscript` - 模拟语音识别结果

生产环境需要：
1. 替换为真实的API调用
2. 搭建后端服务器处理敏感操作
3. 配置正确的回调地址

## 技术栈

- **React Native** - 跨平台移动应用框架
- **Expo** - React Native 开发工具链
- **TypeScript** - 类型安全的 JavaScript
- **React Navigation** - 页面导航
- **Zustand** - 状态管理
- **React Native Reanimated** - 高性能动画
- **React Native SVG** - SVG 图形
- **Expo AV** - 音频播放和录音
- **Expo Linear Gradient** - 渐变背景

## 主题配色

应用采用自然清新的配色方案：
- **主色**: 森林绿 `#2D5016`
- **辅助色**: 天空蓝 `#87CEEB`
- **强调色**: 阳光黄 `#F4D03F`
- **VIP金**: 金色 `#FFD700`

## 注意事项

1. **微信SDK**: 需要在原生项目中集成微信SDK，Expo Go 中无法测试微信登录/支付
2. **音频权限**: 应用需要麦克风权限进行语音对话
3. **网络权限**: 应用需要网络访问权限调用API
4. **后端服务**: 微信支付需要后端服务支持，前端代码仅作演示

## 许可证

MIT License
