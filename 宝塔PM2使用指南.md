# 宝塔面板 PM2 使用指南

## 方法 1：使用宝塔的 PM2 管理器（图形化，推荐）

### 步骤 1：安装 PM2 管理器

1. 登录宝塔面板
2. 点击左侧 **软件商店**
3. 搜索 **PM2 管理器**
4. 点击 **安装**

### 步骤 2：添加项目

1. 安装完成后，点击 **设置**（或在左侧菜单找到 PM2 管理器）
2. 点击 **添加项目**
3. 填写信息：
   - **项目名称**: `crypto-app`
   - **启动文件类型**: 选择 `npm`
   - **项目路径**: `/www/wwwroot/scanu.cc/scanu`
   - **启动文件**: `start`（npm 脚本名称）
   - **端口**: `3000`（可选）

4. 点击 **提交**

### 步骤 3：管理项目

在 PM2 管理器界面可以：
- ▶️ **启动** - 启动应用
- ⏸️ **停止** - 停止应用
- 🔄 **重启** - 重启应用
- 📊 **监控** - 查看 CPU、内存使用
- 📝 **日志** - 查看应用日志
- ❌ **删除** - 删除项目

---

## 方法 2：使用命令行（更灵活）

### 步骤 1：安装 PM2

在宝塔终端执行：

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 -v
```

### 步骤 2：启动应用

```bash
# 进入项目目录
cd /www/wwwroot/scanu.cc/scanu

# 启动应用
pm2 start npm --name crypto-app -- start

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 步骤 3：常用命令

```bash
# 查看所有进程
pm2 list

# 查看详细信息
pm2 info crypto-app

# 查看日志
pm2 logs crypto-app

# 实时日志
pm2 logs crypto-app --lines 100 -f

# 重启
pm2 restart crypto-app

# 停止
pm2 stop crypto-app

# 删除
pm2 delete crypto-app

# 监控
pm2 monit
```

---

## 方法 3：使用 PM2 配置文件（最专业）

### 创建配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'crypto-app',
    cwd: '/www/wwwroot/scanu.cc/scanu',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/www/wwwroot/scanu.cc/logs/error.log',
    out_file: '/www/wwwroot/scanu.cc/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};
```

### 使用配置文件

```bash
# 启动
pm2 start ecosystem.config.js

# 重启
pm2 restart ecosystem.config.js

# 停止
pm2 stop ecosystem.config.js

# 删除
pm2 delete ecosystem.config.js
```

---

## 快速启动命令

### 基本启动

```bash
cd /www/wwwroot/scanu.cc/scanu
pm2 start npm --name crypto-app -- start
pm2 save
```

### 指定端口启动

```bash
cd /www/wwwroot/scanu.cc/scanu
PORT=8080 pm2 start npm --name crypto-app -- start
pm2 save
```

### 使用环境变量

```bash
cd /www/wwwroot/scanu.cc/scanu
pm2 start npm --name crypto-app -- start --env production
pm2 save
```

---

## PM2 常用操作

### 查看状态

```bash
# 列表视图
pm2 list

# 详细信息
pm2 info crypto-app

# 实时监控
pm2 monit
```

### 日志管理

```bash
# 查看所有日志
pm2 logs

# 查看特定应用日志
pm2 logs crypto-app

# 实时日志（最后 100 行）
pm2 logs crypto-app --lines 100 -f

# 清空日志
pm2 flush

# 重载日志
pm2 reloadLogs
```

### 进程管理

```bash
# 重启
pm2 restart crypto-app

# 重载（0 秒停机）
pm2 reload crypto-app

# 停止
pm2 stop crypto-app

# 删除
pm2 delete crypto-app

# 停止所有
pm2 stop all

# 重启所有
pm2 restart all
```

### 保存和恢复

```bash
# 保存当前进程列表
pm2 save

# 恢复保存的进程
pm2 resurrect

# 清空保存的进程列表
pm2 cleardump
```

### 开机自启

```bash
# 生成启动脚本
pm2 startup

# 保存当前进程列表
pm2 save

# 禁用开机自启
pm2 unstartup
```

---

## 在宝塔面板中的完整流程

### 1. 安装 Node.js

1. 软件商店 → 搜索 **Node 版本管理器**
2. 安装并设置 Node.js v18 或更高版本

### 2. 安装 PM2

**方法 A：使用宝塔 PM2 管理器**
- 软件商店 → 搜索 **PM2 管理器** → 安装

**方法 B：使用命令行**
```bash
npm install -g pm2
```

### 3. 构建项目

在终端执行：
```bash
cd /www/wwwroot/scanu.cc/scanu
npm run build
```

### 4. 启动应用

**使用 PM2 管理器（图形化）：**
1. 打开 PM2 管理器
2. 添加项目
3. 填写信息并启动

**使用命令行：**
```bash
cd /www/wwwroot/scanu.cc/scanu
pm2 start npm --name crypto-app -- start
pm2 save
pm2 startup
```

### 5. 配置反向代理

1. 网站 → 选择站点 → 设置
2. 反向代理 → 添加反向代理
3. 填写：
   - 代理名称：`crypto-app`
   - 目标URL：`http://127.0.0.1:3000`
   - 发送域名：`$host`

### 6. 配置 SSL（可选）

1. 站点设置 → SSL
2. Let's Encrypt → 申请证书
3. 开启强制 HTTPS

---

## 故障排查

### 应用无法启动

```bash
# 查看日志
pm2 logs crypto-app

# 查看详细信息
pm2 info crypto-app

# 检查端口占用
netstat -tlnp | grep 3000

# 手动测试启动
cd /www/wwwroot/scanu.cc/scanu
npm start
```

### 内存占用过高

```bash
# 设置内存限制
pm2 start npm --name crypto-app --max-memory-restart 500M -- start

# 或修改 ecosystem.config.js
max_memory_restart: '500M'
```

### 应用频繁重启

```bash
# 查看日志找原因
pm2 logs crypto-app --lines 200

# 检查错误日志
pm2 logs crypto-app --err

# 禁用自动重启（调试用）
pm2 start npm --name crypto-app --no-autorestart -- start
```

### PM2 命令找不到

```bash
# 检查 PM2 是否安装
which pm2

# 重新安装
npm install -g pm2

# 或使用 npx
npx pm2 list
```

---

## 性能优化

### 集群模式（多核 CPU）

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'crypto-app',
    script: 'npm',
    args: 'start',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    autorestart: true,
  }]
};
```

### 日志轮转

```bash
# 安装日志轮转模块
pm2 install pm2-logrotate

# 配置
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 监控和告警

```bash
# 安装监控模块
pm2 install pm2-server-monit

# 查看监控
pm2 web
```

---

## 常见问题

### Q: PM2 和宝塔的 Node 项目管理器有什么区别？

A: 
- **PM2 管理器**：功能更强大，支持集群、日志管理、监控
- **Node 项目管理器**：更简单，适合基本需求

推荐使用 PM2 管理器。

### Q: 如何查看应用是否正常运行？

A:
```bash
pm2 list
pm2 logs crypto-app
curl http://localhost:3000
```

### Q: 如何更新代码后重启？

A:
```bash
cd /www/wwwroot/scanu.cc/scanu
git pull  # 或上传新代码
npm run build
pm2 restart crypto-app
```

### Q: 如何备份 PM2 配置？

A:
```bash
pm2 save
# 配置保存在 ~/.pm2/dump.pm2
```

---

## 推荐配置

### 生产环境配置

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'crypto-app',
    cwd: '/www/wwwroot/scanu.cc/scanu',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
```

### 启动命令

```bash
cd /www/wwwroot/scanu.cc/scanu
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 总结

1. ✅ 推荐使用宝塔的 PM2 管理器（图形化界面）
2. ✅ 或使用命令行 PM2（更灵活）
3. ✅ 配置开机自启：`pm2 startup` + `pm2 save`
4. ✅ 定期查看日志：`pm2 logs crypto-app`
5. ✅ 监控资源使用：`pm2 monit`
