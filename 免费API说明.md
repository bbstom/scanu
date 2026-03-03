# 免费 API 说明

## 概述

项目已配置多个免费公共 API 作为备用方案。即使没有配置 API Keys，也可以正常使用查询功能。

## API 优先级策略

系统会按以下顺序尝试 API：

1. **配置的 API Key**（如果有）
2. **免费公共 API**（自动切换）
3. **备用 API**（多个源）

如果一个 API 失败，会自动尝试下一个，确保服务可用性。

## 支持的免费 API

### 以太坊 (Ethereum)

#### 1. Etherscan（需要 API Key）
- **网站**: https://etherscan.io/
- **限制**: 免费版每秒 5 次请求
- **优点**: 数据最全面，更新最快
- **配置**: 在后台管理配置 API Key

#### 2. Ethplorer（免费，无需注册）
- **API**: https://api.ethplorer.io/
- **限制**: 每秒 1 次请求
- **优点**: 完全免费，无需注册
- **功能**: 余额查询、代币信息

#### 3. Blockscout（免费，无需注册）
- **API**: https://eth.blockscout.com/api
- **限制**: 较宽松
- **优点**: 开源，稳定
- **功能**: 余额、交易记录

### 比特币 (Bitcoin)

#### 1. Blockchain.info（免费，无需注册）
- **API**: https://blockchain.info/
- **限制**: 无严格限制
- **优点**: 老牌服务，稳定可靠
- **功能**: 余额、交易记录、UTXO

#### 2. Blockchair（免费，无需注册）
- **API**: https://api.blockchair.com/
- **限制**: 每天 1440 次请求（免费版）
- **优点**: 支持多链，数据详细
- **功能**: 余额、交易、统计

#### 3. Blockcypher（免费，无需注册）
- **API**: https://api.blockcypher.com/
- **限制**: 每小时 200 次请求
- **优点**: 响应快，文档完善
- **功能**: 余额、交易、推送通知

### 波场 (TRON)

#### 1. TronGrid（需要 API Key）
- **网站**: https://www.trongrid.io/
- **限制**: 免费版每天 15000 次请求
- **优点**: 官方 API，最准确
- **配置**: 在后台管理配置 API Key

#### 2. TronScan（免费，无需注册）
- **API**: https://apilist.tronscan.org/
- **限制**: 较宽松
- **优点**: 完全免费，功能全面
- **功能**: 余额、交易、代币、能量

#### 3. Shasta Testnet（免费，无需注册）
- **API**: https://api.shasta.trongrid.io/
- **限制**: 无限制（测试网）
- **注意**: 仅用于测试，主网数据不准确

### 价格数据

#### CoinGecko（免费，无需注册）
- **API**: https://api.coingecko.com/
- **限制**: 每分钟 10-50 次请求
- **优点**: 完全免费，数据全面
- **功能**: 实时价格、历史数据、市值

## 使用方式

### 无需配置（开箱即用）

项目已内置所有免费 API，无需任何配置即可使用：

```bash
# 1. 配置数据库
MONGODB_URI=mongodb://localhost:27017/crypto-wallet-explorer

# 2. 启动项目
npm run dev

# 3. 直接使用，无需 API Keys
```

### 推荐配置（更好的性能）

虽然免费 API 可用，但推荐配置官方 API Key 以获得：
- 更高的请求限制
- 更快的响应速度
- 更稳定的服务

在后台管理 `/admin/settings` 配置：
- Etherscan API Key
- TronGrid API Key

## API 切换逻辑

### 自动切换流程

```
1. 尝试使用配置的 API Key
   ↓ 失败
2. 尝试第一个免费 API
   ↓ 失败
3. 尝试第二个免费 API
   ↓ 失败
4. 尝试第三个免费 API
   ↓ 全部失败
5. 返回错误信息
```

### 日志输出

系统会在控制台输出 API 切换信息：

```
尝试使用备用 API: Ethplorer (免费)
✓ Ethplorer (免费) 成功
```

或

```
Etherscan API 失败，尝试备用 API: Authentication failed
尝试使用备用 API: Blockscout (免费)
✓ Blockscout (免费) 成功
```

## API 限制说明

### 免费 API 的限制

| API | 每秒请求 | 每天请求 | 需要注册 |
|-----|---------|---------|---------|
| Ethplorer | 1 | 无限制 | 否 |
| Blockscout | 5 | 无限制 | 否 |
| Blockchain.info | 无限制 | 无限制 | 否 |
| Blockchair | 无限制 | 1440 | 否 |
| Blockcypher | 3 | 200/小时 | 否 |
| TronScan | 5 | 无限制 | 否 |
| CoinGecko | 10-50/分钟 | 无限制 | 否 |

### 付费 API 的优势

| API | 免费版 | 付费版 |
|-----|--------|--------|
| Etherscan | 5次/秒 | 100次/秒 |
| TronGrid | 15000次/天 | 无限制 |
| CoinGecko | 50次/分钟 | 500次/分钟 |

## 优化建议

### 1. 使用 Redis 缓存

配置 Redis 可以大幅减少 API 调用：

```env
REDIS_URL=redis://localhost:6379
```

缓存策略：
- 余额数据：缓存 5 分钟
- 交易记录：缓存 10 分钟
- 价格数据：缓存 1 分钟

### 2. 配置官方 API Key

虽然免费 API 可用，但推荐配置官方 API Key：
- 更稳定的服务
- 更快的响应
- 更高的限制

### 3. 监控 API 使用

在生产环境建议：
- 记录 API 调用次数
- 监控失败率
- 设置告警阈值

## 常见问题

### Q: 为什么有时查询很慢？
A: 免费 API 可能有速率限制，系统会自动切换到其他 API。配置官方 API Key 可以提升速度。

### Q: 查询失败怎么办？
A: 系统会自动尝试多个 API。如果全部失败，请稍后重试或配置官方 API Key。

### Q: 免费 API 数据准确吗？
A: 是的，所有 API 都从区块链获取数据，准确性相同。

### Q: 需要配置所有 API Key 吗？
A: 不需要。免费 API 已经可以正常使用。配置 API Key 只是为了更好的性能。

### Q: 如何知道当前使用的是哪个 API？
A: 查看浏览器控制台或服务器日志，会显示 API 切换信息。

## 测试 API

访问测试页面验证 API 是否正常：

```
http://localhost:3000/test
```

可以测试：
- 以太坊 API
- 比特币 API
- 波场 API

## 总结

✅ **无需配置即可使用** - 所有免费 API 已内置
✅ **自动切换** - API 失败时自动尝试其他源
✅ **多个备用** - 每条链都有 2-3 个备用 API
✅ **完全免费** - 大部分功能无需注册
✅ **可选升级** - 配置官方 API Key 获得更好性能

现在你可以直接使用项目，无需担心 API Key 的问题！
