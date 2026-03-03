# Redis 缓存功能说明

## 功能概述

为了提升性能和减少对第三方 API 的调用频率，系统已集成 Redis 缓存功能。

## 缓存策略

### 缓存时间（TTL）

- **余额查询**: 60 秒（1 分钟）
- **交易记录**: 120 秒（2 分钟）

### 缓存键格式

```
eth:balance:{address}           # 以太坊余额
eth:transactions:{address}:{limit}  # 以太坊交易

btc:balance:{address}           # 比特币余额
btc:transactions:{address}:{limit}  # 比特币交易

trx:balance:{address}           # 波场余额
trx:transactions:{address}:{limit}  # 波场交易
```

## 配置说明

### 环境变量

在 `.env` 文件中配置：

```env
# Redis 连接地址
REDIS_URL=redis://localhost:6379

# 如果 Redis 有密码
REDIS_URL=redis://:your_password@localhost:6379

# 启用/禁用缓存（默认启用）
REDIS_ENABLED=true
```

### 禁用缓存

如果不想使用 Redis 缓存，可以：

1. 设置 `REDIS_ENABLED=false`
2. 或者不配置 `REDIS_URL`

系统会自动降级为无缓存模式，直接调用 API。

## 工作原理

### 缓存流程

1. **查询请求到达**
   - 系统首先尝试从 Redis 获取缓存数据
   
2. **缓存命中**
   - 如果缓存存在且未过期，直接返回缓存数据
   - 日志显示：`✓ 缓存命中: {key}`
   
3. **缓存未命中**
   - 调用第三方 API 获取最新数据
   - 将数据保存到 Redis（设置 TTL）
   - 返回数据给用户
   - 日志显示：`✗ 缓存未命中: {key}，执行查询...`

### 容错机制

- Redis 连接失败时，系统自动降级为无缓存模式
- 不会因为 Redis 问题导致查询失败
- 连接重试最多 3 次，超时 5 秒

## 性能优势

### 减少 API 调用

- **429 错误（请求过多）**: 大幅减少
- **API 配额**: 节省 API 调用次数
- **响应速度**: 缓存命中时响应时间 < 10ms

### 示例对比

| 场景 | 无缓存 | 有缓存 |
|------|--------|--------|
| 首次查询 | 2-5 秒 | 2-5 秒 |
| 1 分钟内重复查询 | 2-5 秒 | < 10ms |
| 每日 API 调用 | 10,000 次 | ~500 次 |

## 监控和调试

### 日志输出

系统会输出详细的缓存日志：

```
✓ Redis 连接成功
✓ 缓存命中: trx:balance:TTY9B985W7DMuLyUP7oqoncamBJ3DkuTRX
✓ 缓存设置: eth:balance:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb (TTL: 60s)
✗ 缓存未命中: btc:balance:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa，执行查询...
```

### Redis 命令行检查

```bash
# 连接到 Redis
redis-cli

# 查看所有缓存键
KEYS *

# 查看特定缓存
GET trx:balance:TTY9B985W7DMuLyUP7oqoncamBJ3DkuTRX

# 查看缓存剩余时间（秒）
TTL trx:balance:TTY9B985W7DMuLyUP7oqoncamBJ3DkuTRX

# 手动删除缓存
DEL trx:balance:TTY9B985W7DMuLyUP7oqoncamBJ3DkuTRX

# 清空所有缓存
FLUSHALL
```

## 安装 Redis

### Windows

1. 下载 Redis for Windows: https://github.com/tporadowski/redis/releases
2. 解压并运行 `redis-server.exe`
3. 默认端口：6379

### macOS

```bash
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Docker

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

## 最佳实践

1. **生产环境**
   - 使用 Redis 持久化（RDB + AOF）
   - 设置 Redis 密码
   - 配置最大内存限制
   - 启用 Redis 集群（高可用）

2. **开发环境**
   - 可以不使用密码
   - 使用默认配置即可

3. **缓存时间调整**
   - 余额变化频繁：减少 TTL（30 秒）
   - 交易记录稳定：增加 TTL（5 分钟）
   - 修改 `src/services/*.ts` 中的 `CACHE_TTL` 配置

## 故障排查

### Redis 连接失败

**症状**: 日志显示 "Redis 连接失败，将不使用缓存"

**解决方案**:
1. 检查 Redis 是否运行：`redis-cli ping`（应返回 PONG）
2. 检查 `REDIS_URL` 配置是否正确
3. 检查防火墙是否阻止 6379 端口

### 缓存数据不更新

**症状**: 数据已更新但页面显示旧数据

**解决方案**:
1. 等待缓存过期（最多 2 分钟）
2. 手动清除缓存：`redis-cli FLUSHALL`
3. 重启应用

### 内存占用过高

**症状**: Redis 内存使用持续增长

**解决方案**:
1. 设置最大内存：`redis-cli CONFIG SET maxmemory 256mb`
2. 设置淘汰策略：`redis-cli CONFIG SET maxmemory-policy allkeys-lru`
3. 定期清理：`redis-cli FLUSHALL`

## 下一步优化

- [ ] 添加缓存预热功能
- [ ] 实现缓存分层（L1: 内存，L2: Redis）
- [ ] 添加缓存统计和监控面板
- [ ] 支持缓存手动刷新按钮
