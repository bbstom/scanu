# 加密钱包在线查询网站

支持以太坊、比特币、波场（TRC-20）的多链钱包查询工具，提供余额、交易记录等信息查询服务。

## 功能特性

- ✅ 支持以太坊 (ETH) 钱包查询
- ✅ 支持比特币 (BTC) 地址查询
- ✅ 支持波场 (TRX) 和 USDT-TRC20 查询
- ✅ 实时余额和价格显示
- ✅ 交易历史记录
- ✅ SEO 优化（SSR）
- ✅ 响应式设计
- ✅ 多语言支持

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: MongoDB
- **缓存**: Redis（可选）
- **区块链 API**: Etherscan, TronGrid, Blockchain.com

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置你的数据库地址和 API Keys：

```env
# MongoDB 数据库地址（必需）
MONGODB_URI=mongodb://你的数据库地址:27017/crypto-wallet-explorer
# 或使用 MongoDB Atlas
# MONGODB_URI=mongodb+srv://用户名:密码@cluster.mongodb.net/crypto-wallet-explorer

# Redis（可选）
REDIS_URL=redis://你的redis地址:6379

# API Keys（必需）
ETHERSCAN_API_KEY=你的etherscan_api_key
TRONGRID_API_KEY=你的trongrid_api_key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 测试功能

访问 [http://localhost:3000/test](http://localhost:3000/test) 测试 API 是否正常工作。

## 获取 API Keys

### Etherscan API Key（必需）
1. 访问 https://etherscan.io/
2. 注册并登录
3. 进入 https://etherscan.io/myapikey
4. 创建免费 API Key

### TronGrid API Key（必需）
1. 访问 https://www.trongrid.io/
2. 注册账号
3. 在控制台创建 API Key

### CoinGecko API（可选）
- 免费版无需 API Key
- 如需更高限制：https://www.coingecko.com/en/api

## MongoDB 配置

支持多种 MongoDB 配置方式：

- **本地数据库**: `mongodb://localhost:27017/crypto-wallet-explorer`
- **远程数据库**: `mongodb://服务器IP:27017/crypto-wallet-explorer`
- **MongoDB Atlas**: `mongodb+srv://用户名:密码@cluster.mongodb.net/crypto-wallet-explorer`
- **带认证**: `mongodb://用户名:密码@服务器:27017/crypto-wallet-explorer?authSource=admin`

## 项目结构

```
├── src/
│   ├── app/              # Next.js 14 App Router
│   ├── components/       # React 组件
│   ├── lib/             # 工具函数和配置
│   ├── models/          # MongoDB 模型
│   ├── services/        # 区块链 API 服务
│   └── types/           # TypeScript 类型定义
├── public/              # 静态资源
└── docs/                # 文档
```

## 构建生产版本

```bash
npm run build
npm start
```

## 部署

### Vercel（推荐）
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（包括 MONGODB_URI）
4. 自动部署

注意：确保 MongoDB 数据库可以从外网访问，推荐使用 MongoDB Atlas。

### 自建服务器
```bash
npm run build
npm start
```

## 文档

- [快速启动.md](./快速启动.md) - 详细的启动指南
- [开发指南.md](./开发指南.md) - 开发文档
- [需求文档.md](./需求文档.md) - 完整需求规划
- [项目完成情况.md](./项目完成情况.md) - 功能清单

## 常见问题

### MongoDB 连接失败？
- 检查 MONGODB_URI 配置是否正确
- 确保数据库服务正在运行
- 检查网络连接和防火墙设置
- 如果使用 MongoDB Atlas，检查 IP 白名单

### API 查询失败？
- 检查 API Key 是否正确配置
- 查看 API 请求限制是否超出
- 访问 /test 页面测试 API

## License

MIT
