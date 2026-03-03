# MongoDB 配置说明

## 配置格式

MongoDB 连接字符串支持多种格式，根据你的实际情况选择：

### 1. 无认证（本地开发）

```env
MONGODB_URI=mongodb://localhost:27017/crypto-wallet-explorer
```

适用场景：本地开发环境，MongoDB 未设置用户名密码

### 2. 有认证（推荐）

```env
MONGODB_URI=mongodb://用户名:密码@localhost:27017/crypto-wallet-explorer?authSource=admin
```

示例：
```env
MONGODB_URI=mongodb://admin:mypassword123@localhost:27017/crypto-wallet-explorer?authSource=admin
```

适用场景：
- 生产环境
- 设置了用户名密码的 MongoDB
- 需要安全认证的环境

### 3. 远程数据库

```env
MONGODB_URI=mongodb://用户名:密码@服务器IP:端口/crypto-wallet-explorer?authSource=admin
```

示例：
```env
MONGODB_URI=mongodb://dbuser:dbpass@192.168.1.100:27017/crypto-wallet-explorer?authSource=admin
```

适用场景：
- MongoDB 部署在其他服务器
- 使用云服务器的 MongoDB

### 4. MongoDB Atlas（云数据库）

```env
MONGODB_URI=mongodb+srv://用户名:密码@cluster.mongodb.net/crypto-wallet-explorer?retryWrites=true&w=majority
```

示例：
```env
MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.abc123.mongodb.net/crypto-wallet-explorer?retryWrites=true&w=majority
```

适用场景：
- 使用 MongoDB Atlas 云服务
- 不想自己维护数据库
- 需要高可用性

### 5. 多个主机（副本集）

```env
MONGODB_URI=mongodb://用户名:密码@host1:27017,host2:27017,host3:27017/crypto-wallet-explorer?replicaSet=myReplicaSet&authSource=admin
```

适用场景：
- 使用 MongoDB 副本集
- 需要高可用性和故障转移

## 参数说明

### authSource
指定认证数据库，通常是 `admin`

```env
?authSource=admin
```

### retryWrites
自动重试写操作（MongoDB Atlas 推荐）

```env
?retryWrites=true
```

### w=majority
写入确认级别

```env
?w=majority
```

### 多个参数用 & 连接

```env
?authSource=admin&retryWrites=true&w=majority
```

## 如何创建 MongoDB 用户

### 方法一：使用 MongoDB Shell

1. 连接到 MongoDB：
```bash
mongo
```

2. 切换到 admin 数据库：
```javascript
use admin
```

3. 创建管理员用户：
```javascript
db.createUser({
  user: "admin",
  pwd: "your_password_here",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})
```

4. 创建应用专用用户（推荐）：
```javascript
use crypto-wallet-explorer

db.createUser({
  user: "appuser",
  pwd: "app_password_here",
  roles: [
    { role: "readWrite", db: "crypto-wallet-explorer" }
  ]
})
```

5. 使用应用用户连接：
```env
MONGODB_URI=mongodb://appuser:app_password_here@localhost:27017/crypto-wallet-explorer?authSource=crypto-wallet-explorer
```

### 方法二：使用 MongoDB Compass（图形界面）

1. 下载并安装 MongoDB Compass
2. 连接到你的 MongoDB
3. 在左侧选择数据库
4. 点击 "Users" 标签
5. 点击 "Add User" 创建用户

## 密码中的特殊字符

如果密码包含特殊字符，需要进行 URL 编码：

| 字符 | 编码 |
|------|------|
| @    | %40  |
| :    | %3A  |
| /    | %2F  |
| ?    | %3F  |
| #    | %23  |
| [    | %5B  |
| ]    | %5D  |
| %    | %25  |

示例：
- 原密码：`pass@word:123`
- 编码后：`pass%40word%3A123`
- 连接串：`mongodb://user:pass%40word%3A123@localhost:27017/dbname`

## 在线编码工具

使用 JavaScript 编码：
```javascript
encodeURIComponent("your_password_here")
```

或访问：https://www.urlencoder.org/

## 测试连接

### 使用 MongoDB Shell 测试

```bash
mongo "mongodb://用户名:密码@localhost:27017/crypto-wallet-explorer?authSource=admin"
```

### 使用 Node.js 测试

创建 `test-connection.js`：
```javascript
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://用户名:密码@localhost:27017/crypto-wallet-explorer?authSource=admin";

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 连接成功！');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB 连接失败：', err.message);
    process.exit(1);
  });
```

运行测试：
```bash
node test-connection.js
```

## 常见错误

### 1. Authentication failed
```
MongoServerError: Authentication failed
```

解决方法：
- 检查用户名和密码是否正确
- 检查 authSource 是否正确
- 确认用户有访问该数据库的权限

### 2. Connection refused
```
MongoNetworkError: connect ECONNREFUSED
```

解决方法：
- 检查 MongoDB 服务是否启动
- 检查 IP 地址和端口是否正确
- 检查防火墙设置

### 3. Invalid connection string
```
Error: Invalid connection string
```

解决方法：
- 检查连接字符串格式
- 特殊字符是否正确编码
- 参数拼写是否正确

### 4. Timeout
```
MongoServerSelectionError: connection timed out
```

解决方法：
- 检查网络连接
- 检查 MongoDB 服务器是否可访问
- 增加连接超时时间：`?connectTimeoutMS=30000`

## 安全建议

### 1. 使用强密码
- 至少 12 个字符
- 包含大小写字母、数字和特殊字符
- 不要使用常见密码

### 2. 限制用户权限
- 不要使用 root 或 admin 用户
- 为应用创建专用用户
- 只授予必要的权限（readWrite）

### 3. 限制网络访问
- 使用防火墙限制访问
- 只允许应用服务器 IP 访问
- 不要将 MongoDB 暴露在公网

### 4. 使用 SSL/TLS
```env
MONGODB_URI=mongodb://user:pass@host:27017/db?ssl=true
```

### 5. 定期备份
```bash
# 备份数据库
mongodump --uri="mongodb://user:pass@host:27017/crypto-wallet-explorer?authSource=admin" --out=/backup/

# 恢复数据库
mongorestore --uri="mongodb://user:pass@host:27017/crypto-wallet-explorer?authSource=admin" /backup/crypto-wallet-explorer/
```

## MongoDB Atlas 配置

### 1. 注册 MongoDB Atlas
访问：https://www.mongodb.com/cloud/atlas

### 2. 创建集群
- 选择免费的 M0 集群
- 选择离你最近的区域

### 3. 创建数据库用户
- Database Access → Add New Database User
- 设置用户名和密码
- 选择权限：Read and write to any database

### 4. 配置网络访问
- Network Access → Add IP Address
- 添加你的 IP 地址
- 或选择 "Allow Access from Anywhere"（0.0.0.0/0）

### 5. 获取连接字符串
- Clusters → Connect → Connect your application
- 复制连接字符串
- 替换 `<password>` 为你的密码
- 替换 `<dbname>` 为 `crypto-wallet-explorer`

示例：
```env
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/crypto-wallet-explorer?retryWrites=true&w=majority
```

## 推荐配置

### 开发环境
```env
# 本地 MongoDB，无认证
MONGODB_URI=mongodb://localhost:27017/crypto-wallet-explorer
```

### 生产环境
```env
# MongoDB Atlas（推荐）
MONGODB_URI=mongodb+srv://用户名:密码@cluster.mongodb.net/crypto-wallet-explorer?retryWrites=true&w=majority

# 或自建服务器（有认证）
MONGODB_URI=mongodb://用户名:密码@服务器IP:27017/crypto-wallet-explorer?authSource=admin
```

## 需要帮助？

如果遇到连接问题：
1. 检查 MongoDB 服务是否运行
2. 验证用户名和密码
3. 确认网络连接
4. 查看错误日志
5. 使用测试脚本验证连接

---

配置完成后，在 `.env` 文件中设置 `MONGODB_URI`，然后启动项目即可。
