# API 限流保护说明

## 功能概述

为了防止 API 滥用和保护服务器资源，系统实现了基于 IP 的限流机制。

## 限流策略

### 默认配置

- **时间窗口**: 60 秒（1 分钟）
- **最大请求数**: 30 次
- **搜索 API**: 20 次/分钟

### 限流规则

| API 端点 | 限制 | 说明 |
|---------|------|------|
| `/api/search` | 20 次/分钟 | 搜索历史记录 |
| 其他 API | 30 次/分钟 | 默认限制 |

## 工作原理

### 1. 客户端识别

系统通过以下方式识别客户端：

```
优先级：
1. X-Forwarded-For 头（代理/负载均衡）
2. X-Real-IP 头
3. 直接连接 IP
```

### 2. 限流算法

使用**滑动窗口计数器**算法：

1. 每个 IP 在 Redis 中维护一个计数器
2. 每次请求增加计数
3. 超过限制返回 429 错误
4. 时间窗口过期后自动重置

### 3. 响应头

所有 API 响应都包含限流信息：

```http
X-RateLimit-Limit: 30          # 时间窗口内最大请求数
X-RateLimit-Remaining: 25      # 剩余可用请求数
X-RateLimit-Reset: 1709280000  # 重置时间（Unix 时间戳）
```

### 4. 超限响应

当超过限制时，返回 429 状态码：

```json
{
  "error": "请求过于频繁，请稍后再试",
  "retryAfter": 45
}
```

响应头包含：
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1709280045
```

## 使用示例

### 在 API 路由中应用限流

```typescript
import { rateLimitMiddleware } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  // 应用限流：每分钟最多 10 次请求
  const rateLimitResponse = await rateLimitMiddleware(request, {
    interval: 60,
    maxRequests: 10,
  });

  if (rateLimitResponse) {
    return rateLimitResponse; // 返回 429 错误
  }

  // 继续处理请求
  return NextResponse.json({ data: "..." });
}
```

### 自定义限流配置

```typescript
// 严格限流：每 30 秒 5 次请求
await rateLimitMiddleware(request, {
  interval: 30,
  maxRequests: 5,
});

// 宽松限流：每 5 分钟 100 次请求
await rateLimitMiddleware(request, {
  interval: 300,
  maxRequests: 100,
});
```

## IP 黑名单

### 功能说明

系统支持将恶意 IP 加入黑名单，完全阻止其访问。

### 管理 API

#### 1. 获取黑名单

```bash
GET /api/admin/blacklist
Authorization: Bearer <token>
```

响应：
```json
{
  "blacklist": ["192.168.1.100", "10.0.0.50"]
}
```

#### 2. 添加到黑名单

```bash
POST /api/admin/blacklist
Authorization: Bearer <token>
Content-Type: application/json

{
  "ip": "192.168.1.100",
  "duration": 3600  // 可选，默认 1 小时
}
```

#### 3. 从黑名单移除

```bash
DELETE /api/admin/blacklist?ip=192.168.1.100
Authorization: Bearer <token>
```

### 代码示例

```typescript
import { addToBlacklist, removeFromBlacklist, isBlacklisted } from "@/lib/rateLimit";

// 检查是否在黑名单
const blocked = await isBlacklisted("192.168.1.100");

// 添加到黑名单（1 小时）
await addToBlacklist("192.168.1.100", 3600);

// 永久加入黑名单（24 小时）
await addToBlacklist("192.168.1.100", 86400);

// 从黑名单移除
await removeFromBlacklist("192.168.1.100");
```

## 统计数据 API

### 获取使用统计

```bash
GET /api/admin/stats
Authorization: Bearer <token>
```

响应示例：
```json
{
  "summary": {
    "totalSearches": 1523,
    "uniqueAddresses": 456,
    "recentSearches24h": 234
  },
  "chainStats": [
    {
      "_id": "eth",
      "count": 678,
      "addresses": 234
    },
    {
      "_id": "btc",
      "count": 456,
      "addresses": 123
    },
    {
      "_id": "trx",
      "count": 389,
      "addresses": 99
    }
  ],
  "topAddresses": [
    {
      "address": "0x742d35Cc...",
      "chainType": "eth",
      "searchCount": 45,
      "lastSearchAt": "2024-03-01T10:30:00Z"
    }
  ],
  "recentAddresses": [...]
}
```

## 监控和调试

### 查看限流状态

```bash
# 连接到 Redis
redis-cli

# 查看所有限流记录
KEYS ratelimit:*

# 查看特定 IP 的限流状态
GET ratelimit:192.168.1.100

# 查看黑名单
GET ratelimit:blacklist

# 手动重置某个 IP 的限流
DEL ratelimit:192.168.1.100
```

### 日志输出

系统会输出限流相关日志：

```
✓ IP 192.168.1.100 已加入黑名单 (3600秒)
✓ IP 192.168.1.100 已从黑名单移除
限流检查失败: Connection refused
```

## 降级策略

当 Redis 不可用时：

1. **限流失败**: 允许请求通过（不阻止）
2. **日志记录**: 记录错误但不影响服务
3. **自动恢复**: Redis 恢复后自动启用限流

这确保了即使 Redis 故障，服务仍然可用。

## 最佳实践

### 1. 生产环境配置

```env
# 启用 Redis（必需）
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379

# 使用 Redis 密码
REDIS_URL=redis://:your_password@localhost:6379
```

### 2. 反向代理配置

如果使用 Nginx 或其他反向代理，确保传递真实 IP：

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 3. 限流策略调整

根据实际情况调整限流参数：

```typescript
// 公共 API - 宽松限流
{ interval: 60, maxRequests: 100 }

// 敏感操作 - 严格限流
{ interval: 60, maxRequests: 5 }

// 搜索功能 - 中等限流
{ interval: 60, maxRequests: 20 }
```

### 4. 监控告警

建议监控以下指标：

- 429 错误率
- 黑名单 IP 数量
- 平均请求频率
- Redis 连接状态

## 故障排查

### 问题 1: 限流不生效

**症状**: 可以无限制发送请求

**原因**:
- Redis 未启动
- REDIS_ENABLED=false
- Redis 连接失败

**解决**:
```bash
# 检查 Redis 状态
redis-cli ping

# 检查环境变量
echo $REDIS_ENABLED

# 查看应用日志
npm run dev
```

### 问题 2: 误判正常用户

**症状**: 正常用户被限流

**原因**:
- 限流阈值过低
- 多用户共享 IP（公司/学校网络）

**解决**:
1. 增加限流阈值
2. 使用用户认证代替 IP 限流
3. 将特定 IP 加入白名单

### 问题 3: 429 错误过多

**症状**: 大量 429 错误

**原因**:
- 爬虫攻击
- 前端重复请求
- 限流阈值过低

**解决**:
1. 检查请求来源
2. 将恶意 IP 加入黑名单
3. 优化前端请求逻辑
4. 调整限流参数

## 安全建议

1. **启用 HTTPS**: 防止中间人攻击
2. **使用 Redis 密码**: 保护 Redis 数据
3. **定期审查黑名单**: 清理过期记录
4. **监控异常流量**: 及时发现攻击
5. **备份限流配置**: 防止配置丢失

## 性能影响

限流功能对性能的影响：

| 操作 | 延迟 | 说明 |
|------|------|------|
| Redis 读取 | < 1ms | 检查限流状态 |
| Redis 写入 | < 1ms | 更新计数器 |
| 总开销 | < 2ms | 可忽略不计 |

## 未来优化

- [ ] 支持基于用户的限流（而非仅 IP）
- [ ] 添加限流白名单功能
- [ ] 实现分布式限流（多服务器）
- [ ] 添加限流统计图表
- [ ] 支持动态调整限流参数
- [ ] 实现智能限流（基于行为分析）
