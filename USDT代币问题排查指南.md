# USDT 代币问题排查指南

## 问题描述
TRX 余额显示正常，但 USDT 代币无法显示。

## 已实施的修复

### 1. 添加详细日志
在 `src/services/tron.ts` 中添加了详细的调试日志，帮助排查问题：

```typescript
console.log(`[TronScan] 账户信息 API 响应:`, {...});
console.log(`[TronScan] 从账户信息获取到 ${filteredTokens.length} 个代币`);
console.log(`[TronScan] 最终返回: TRX=${balanceInTrx}, 代币数=${tokens.length}`);
```

### 2. 添加备用 API 端点
如果主 API 端点（`/account`）没有返回代币数据，会自动尝试备用端点（`/account/tokens`）：

```typescript
// 方法1: 从账户信息中获取代币
if (accountRes.data.tokens && Array.isArray(accountRes.data.tokens)) {
  // 处理代币...
}

// 方法2: 尝试使用 TRC20 代币 API（如果方法1没有获取到代币）
if (tokens.length === 0) {
  const trc20Res = await axios.get(`${platform.url}/account/tokens`, {...});
  // 处理代币...
}
```

## 排查步骤

### 步骤 1: 清除缓存
Redis 缓存可能包含旧数据，需要清除：

```bash
# 连接到 Redis
redis-cli

# 清除波场相关缓存
KEYS trx:*
DEL trx:balance:* trx:transactions:* trx:tokens:*

# 或者清除所有缓存
FLUSHDB
```

### 步骤 2: 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### 步骤 3: 查看控制台日志
访问一个波场地址，查看服务器控制台输出：

```
[TronScan] 账户信息 API 响应: { balance: 1000000, hasTokens: true, tokensCount: 2 }
[TronScan] 从账户信息获取到 2 个代币
[TronScan] 最终返回: TRX=1.000000, 代币数=2
```

### 步骤 4: 使用测试 API
访问测试端点查看原始 API 响应：

```
http://localhost:3000/api/test/tron-tokens?address=YOUR_ADDRESS
```

这会返回 TronScan API 的原始响应数据。

## 可能的问题原因

### 1. API 端点变更
TronScan API 可能更改了端点或响应格式。

**解决方案**: 
- 查看测试 API 的响应
- 根据实际响应调整代码

### 2. 缓存问题
Redis 中缓存了旧的、不包含代币的数据。

**解决方案**: 
- 清除 Redis 缓存
- 或者禁用缓存进行测试

### 3. API 限流
TronScan 免费 API 可能有调用限制。

**解决方案**: 
- 等待一段时间后重试
- 配置 TronGrid API Key
- 切换到 TronGrid 平台

### 4. 地址没有代币
测试的地址可能确实没有 USDT 代币。

**解决方案**: 
- 使用已知有 USDT 的地址测试
- 推荐测试地址: `TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE`

### 5. 代币数据格式变化
API 返回的代币数据字段名可能不同。

**解决方案**: 
- 查看日志中的原始数据
- 调整字段映射代码

## 测试地址

### 已知有 USDT 的地址
```
TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE  - 波场基金会
TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t  - USDT 合约地址（不要用这个查询）
```

### 测试步骤
1. 清除缓存
2. 重启服务器
3. 访问: `http://localhost:3000/trx/TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE`
4. 查看控制台日志
5. 检查页面是否显示 USDT

## 后台配置检查

### 检查 TRX API 配置
1. 访问: `http://localhost:3000/admin/settings/api/tron`
2. 确认至少有一个平台是启用状态
3. 确认平台 URL 正确：
   - TronScan: `https://apilist.tronscan.org/api`
   - TronGrid: `https://api.trongrid.io`

### 切换到 TronGrid
如果 TronScan 有问题，可以切换到 TronGrid：

1. 在后台禁用 TronScan
2. 启用 TronGrid
3. 配置 TronGrid API Key（可选，但推荐）
4. 保存配置

## API 响应格式参考

### TronScan `/account` 响应
```json
{
  "balance": 1000000,
  "tokens": [
    {
      "tokenId": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      "tokenName": "Tether USD",
      "tokenAbbr": "USDT",
      "balance": "1000000",
      "tokenDecimal": 6,
      "tokenType": "trc20"
    }
  ]
}
```

### TronScan `/account/tokens` 响应
```json
{
  "data": [
    {
      "token_id": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      "token_name": "Tether USD",
      "token_abbr": "USDT",
      "balance": "1000000",
      "token_decimal": 6
    }
  ]
}
```

### TronGrid `/v1/accounts/{address}/tokens` 响应
```json
{
  "data": [
    {
      "token_id": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
      "token_name": "Tether USD",
      "token_abbr": "USDT",
      "balance": "1000000",
      "token_decimal": 6
    }
  ]
}
```

## 代码调试

### 临时禁用缓存
在 `src/services/tron.ts` 中临时禁用缓存进行测试：

```typescript
export async function getTrxBalance(address: string): Promise<TrxBalance> {
  // 临时注释掉缓存
  // const cacheKey = `trx:balance:${address}`;
  // return getCachedDataWithFallback(cacheKey, async () => {
  
  const data = await callApiWithFallback("TRX", async (platform: ApiPlatform) => {
    // ...
  });

  return {
    address,
    ...data,
    balanceUSD: 0,
  };
  
  // }, 60);
}
```

### 直接调用 API 测试
创建一个简单的测试脚本：

```typescript
// test-tron-api.ts
import axios from "axios";

async function test() {
  const address = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";
  
  const res = await axios.get("https://apilist.tronscan.org/api/account", {
    params: { address },
  });
  
  console.log("Balance:", res.data.balance);
  console.log("Tokens:", res.data.tokens);
}

test();
```

## 预期结果

修复后，查询波场地址应该：

1. ✅ 显示正确的 TRX 余额
2. ✅ 显示 USDT 余额（如果地址有 USDT）
3. ✅ 在代币列表中显示所有 TRC-20 代币
4. ✅ 控制台显示详细的调试日志
5. ✅ 数据与 TronScan 浏览器一致

## 下一步

如果问题仍然存在：

1. 提供控制台日志输出
2. 提供测试 API 的响应
3. 提供测试的地址
4. 说明使用的是哪个 API 平台（TronScan 还是 TronGrid）

这样可以更准确地定位问题。

---

**文档状态**: ✅ 已完成
**最后更新**: 2024-03-01
