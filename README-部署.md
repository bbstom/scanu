# 生产环境部署说明

## 🎯 问题已解决

之前的 `SIGBUS` 构建错误已经通过优化配置解决。现在项目只需要 512MB 内存即可构建。

---

## 🚀 快速开始（3步完成）

### 第 1 步：上传代码到服务器

确保所有文件已上传到：`/www/wwwroot/scanu.cc/scanu`

### 第 2 步：执行部署

在宝塔面板终端执行：

```bash
cd /www/wwwroot/scanu.cc/scanu
bash 一键部署.sh
```

### 第 3 步：启动应用

```bash
pm2 start npm --name crypto-app -- start
pm2 save
```

完成！应用现在运行在 `http://localhost:3000`

---

## 📚 详细文档

| 文档 | 说明 |
|------|------|
| `构建问题已解决.md` | ✅ 问题解决方案和优化说明 |
| `宝塔部署步骤.md` | 📖 详细的宝塔面板部署指南 |
| `快速部署命令.txt` | ⚡ 常用命令速查表 |
| `生产环境部署指南.md` | 📝 完整的部署文档 |

---

## 🛠️ 部署脚本

| 脚本 | 用途 |
|------|------|
| `一键部署.sh` | 最简单的一键部署 |
| `deploy-production.sh` | 完整的自动化部署（含检查） |

---

## 💡 核心优化

### 1. 内存使用优化

**之前：**
- 开发：4096MB
- 构建：4096MB
- 结果：服务器内存不足，构建失败

**现在：**
- 开发：默认 (~512MB)
- 构建：512MB
- 结果：可以在小内存服务器上构建

### 2. 配置文件优化

- ✅ `package.json` - 移除高内存限制
- ✅ `.npmrc` - 注释掉 4GB 配置
- ✅ `next.config.mjs` - 添加构建优化

### 3. 构建策略优化

- 减少并行 worker 数量
- 优化代码分割策略
- 启用 SWC 压缩

---

## 🎮 常用命令

### 构建
```bash
# 标准构建
npm run build

# 低内存构建
NODE_OPTIONS='--max-old-space-size=512' npm run build

# 超低内存构建
NODE_OPTIONS='--max-old-space-size=256' npm run build
```

### 启动
```bash
# 直接启动
npm start

# PM2 启动
pm2 start npm --name crypto-app -- start
```

### 管理
```bash
# 查看状态
pm2 list

# 查看日志
pm2 logs crypto-app

# 重启
pm2 restart crypto-app

# 停止
pm2 stop crypto-app
```

---

## 🔧 环境配置

### 1. 复制环境变量
```bash
cp .env.example .env
```

### 2. 编辑 .env
```env
MONGODB_URI=mongodb://localhost:27017/crypto-explorer
REDIS_HOST=localhost
REDIS_PORT=6379
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_SITE_URL=https://scanu.cc
```

### 3. 配置反向代理

在宝塔面板：
1. 添加站点（域名：scanu.cc）
2. 配置反向代理（目标：http://127.0.0.1:3000）
3. 申请 SSL 证书

---

## 📊 系统要求

### 最低配置
- CPU: 1 核心
- 内存: 512MB RAM + 2GB Swap
- 磁盘: 10GB

### 推荐配置
- CPU: 2 核心
- 内存: 1GB RAM + 1GB Swap
- 磁盘: 20GB

### 理想配置
- CPU: 4 核心
- 内存: 2GB RAM
- 磁盘: 40GB

---

## ❓ 常见问题

### Q1: 构建时还是内存不足？

**解决方案 A：创建 Swap**
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

**解决方案 B：使用更小内存**
```bash
NODE_OPTIONS='--max-old-space-size=256' npm run build
```

**解决方案 C：本地构建**
```bash
# 在本地
npm run build
tar -czf build.tar.gz .next

# 上传到服务器并解压
```

### Q2: 如何更新代码？

```bash
cd /www/wwwroot/scanu.cc/scanu
git pull  # 或上传新文件
NODE_OPTIONS='--max-old-space-size=512' npm run build
pm2 restart crypto-app
```

### Q3: 如何查看错误日志？

```bash
# PM2 日志
pm2 logs crypto-app

# 实时日志
pm2 logs crypto-app --lines 100 -f
```

### Q4: 端口被占用怎么办？

```bash
# 查看占用进程
netstat -tlnp | grep 3000

# 杀死进程
kill -9 <PID>
```

---

## 🔍 验证部署

### 1. 检查构建
```bash
ls -lh .next
```
应该看到 `.next` 目录存在

### 2. 检查进程
```bash
pm2 list
```
应该看到 `crypto-app` 状态为 `online`

### 3. 测试访问
```bash
curl http://localhost:3000
```
应该返回 HTML 内容

### 4. 浏览器访问
```
https://scanu.cc
```
应该能正常访问网站

---

## 📞 获取帮助

如果遇到问题：

1. 查看 `宝塔部署步骤.md` 的常见问题部分
2. 检查日志：`pm2 logs crypto-app`
3. 检查系统资源：`free -h` 和 `df -h`
4. 查看 `快速部署命令.txt` 的问题排查部分

---

## 📝 部署检查清单

- [ ] 代码已上传到服务器
- [ ] 已安装 Node.js (v18+)
- [ ] 已安装 MongoDB
- [ ] 已安装 Redis（可选）
- [ ] 已复制并配置 .env 文件
- [ ] 已执行 `npm install`
- [ ] 已执行构建（`npm run build` 或使用脚本）
- [ ] 已启动应用（`pm2 start`）
- [ ] 已配置反向代理
- [ ] 已申请 SSL 证书
- [ ] 已测试访问

---

## 🎉 部署成功

如果一切正常，你应该能够：

✅ 访问网站：https://scanu.cc  
✅ 查询 BTC/ETH/TRX 地址  
✅ 查看交易记录  
✅ 访问管理后台：https://scanu.cc/admin  

恭喜！部署完成！🎊
