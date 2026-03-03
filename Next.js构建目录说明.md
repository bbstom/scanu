# Next.js 构建目录说明

## Next.js vs 其他框架

### Next.js（本项目）

```
构建命令: npm run build
输出目录: .next/
启动命令: npm start
```

构建后的目录结构：
```
.next/
├── cache/              # 构建缓存
├── server/             # 服务端代码
│   ├── app/           # App Router 页面
│   ├── chunks/        # 代码块
│   └── pages/         # Pages Router（如果有）
├── static/            # 静态资源
│   ├── chunks/        # JavaScript 代码块
│   ├── css/           # CSS 文件
│   └── media/         # 媒体文件
├── build-manifest.json
├── package.json
└── ...
```

### Vue/React（Vite/CRA）

```
构建命令: npm run build
输出目录: dist/
启动命令: 需要静态服务器（nginx/serve）
```

---

## 为什么 Next.js 使用 .next 而不是 dist？

### 1. Next.js 是全栈框架

- **包含服务端代码** - 需要 Node.js 运行
- **包含客户端代码** - 浏览器运行的 JavaScript
- **包含 API 路由** - 后端 API 接口
- **支持 SSR/SSG** - 服务端渲染和静态生成

### 2. 需要 Node.js 服务器

Next.js 不是纯静态网站，需要：
- Node.js 服务器运行
- 处理动态路由
- 执行服务端代码
- 处理 API 请求

### 3. 不能直接部署到静态服务器

❌ 不能这样做：
```bash
# 错误：不能直接用 nginx 托管 .next 目录
nginx → .next/
```

✅ 正确的方式：
```bash
# 需要 Node.js 服务器
npm start → .next/ → 用户访问
```

---

## 构建和运行流程

### 1. 开发模式

```bash
npm run dev
```

- 不生成 `.next` 目录（或生成临时的）
- 实时编译
- 热更新
- 运行在 http://localhost:3000

### 2. 生产构建

```bash
npm run build
```

- 生成 `.next` 目录
- 优化代码
- 压缩资源
- 生成静态页面（如果使用 SSG）

### 3. 生产运行

```bash
npm start
```

- 读取 `.next` 目录
- 启动 Node.js 服务器
- 处理请求
- 运行在 http://localhost:3000

---

## 检查构建是否成功

### 1. 检查 .next 目录

```bash
ls -la .next/

# 应该看到：
# drwxr-xr-x  cache/
# drwxr-xr-x  server/
# drwxr-xr-x  static/
# -rw-r--r--  build-manifest.json
# -rw-r--r--  package.json
```

### 2. 检查目录大小

```bash
du -sh .next/

# 通常大小：20MB - 100MB
```

### 3. 检查关键文件

```bash
# 检查服务端页面
ls .next/server/app/

# 检查静态资源
ls .next/static/

# 检查构建清单
cat .next/build-manifest.json
```

---

## 部署方式对比

### 方式 1：Node.js 服务器（本项目使用）

```bash
# 构建
npm run build

# 运行
npm start
# 或
pm2 start npm --name crypto-app -- start
```

**优点：**
- ✅ 支持所有 Next.js 功能
- ✅ 支持 SSR（服务端渲染）
- ✅ 支持 API 路由
- ✅ 支持动态路由

**缺点：**
- ❌ 需要 Node.js 服务器
- ❌ 需要持续运行

### 方式 2：静态导出（如果只需要静态网站）

修改 `next.config.mjs`：
```javascript
const nextConfig = {
  output: 'export',  // 静态导出
};
```

构建：
```bash
npm run build
```

会生成 `out/` 目录（而不是 `.next/`），可以部署到：
- Nginx
- Apache
- CDN
- 静态托管服务

**限制：**
- ❌ 不支持 SSR
- ❌ 不支持 API 路由
- ❌ 不支持动态路由（需要预生成）
- ❌ 不支持 ISR（增量静态再生成）

### 方式 3：Vercel/Netlify（推荐用于简单项目）

直接连接 Git 仓库，自动构建和部署。

---

## 常见问题

### Q1: 为什么没有 dist 目录？

A: Next.js 使用 `.next` 目录，这是正常的。不同框架有不同的约定：
- Next.js → `.next/`
- Nuxt.js → `.nuxt/` 或 `.output/`
- Vue (Vite) → `dist/`
- React (CRA) → `build/`

### Q2: 可以把 .next 改名为 dist 吗？

A: 不建议。Next.js 内部硬编码了 `.next` 路径，改名会导致问题。

### Q3: .next 目录可以删除吗？

A: 
- **开发时**：可以删除，`npm run dev` 会重新生成
- **生产时**：不能删除，应用需要它才能运行

### Q4: 需要把 .next 提交到 Git 吗？

A: 不需要。`.next` 应该在 `.gitignore` 中：
```
# .gitignore
.next/
```

每次部署时重新构建。

### Q5: 如何只部署静态文件？

A: 如果你的项目不需要 SSR 和 API 路由，可以使用静态导出：

```javascript
// next.config.mjs
const nextConfig = {
  output: 'export',
};
```

然后构建会生成 `out/` 目录，可以部署到任何静态服务器。

### Q6: .next 目录太大怎么办？

A: 
```bash
# 清理缓存
rm -rf .next/cache

# 重新构建
npm run build
```

或在 `next.config.mjs` 中优化：
```javascript
const nextConfig = {
  compress: true,  // 启用压缩
  swcMinify: true, // 使用 SWC 压缩
};
```

---

## 本项目的构建配置

### next.config.mjs

```javascript
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  output: 'standalone',  // 独立输出模式
  swcMinify: true,
};
```

`output: 'standalone'` 会生成：
```
.next/
└── standalone/        # 独立运行所需的所有文件
    ├── .next/
    ├── node_modules/  # 只包含生产依赖
    ├── package.json
    └── server.js      # 启动文件
```

这样可以：
- 减小部署包大小
- 只包含必需的依赖
- 更容易 Docker 化

---

## 验证构建

### 1. 检查构建输出

构建成功后应该看到：
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (38/38)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         95.3 kB
├ ○ /admin                               3.8 kB         93.9 kB
...
```

### 2. 测试运行

```bash
# 启动
npm start

# 测试访问
curl http://localhost:3000

# 应该返回 HTML 内容
```

### 3. 检查文件

```bash
# 查看 .next 目录
ls -lh .next/

# 查看服务端文件
ls .next/server/app/

# 查看静态资源
ls .next/static/
```

---

## 总结

1. ✅ Next.js 构建生成 `.next` 目录（不是 `dist`）
2. ✅ 这是正常的，不是错误
3. ✅ 需要使用 `npm start` 或 PM2 运行
4. ✅ 不能直接用 nginx 托管 `.next` 目录
5. ✅ 如果需要静态部署，使用 `output: 'export'`

你的构建已经成功了，现在可以使用 PM2 启动应用：

```bash
cd /www/wwwroot/scanu.cc/scanu
pm2 start npm --name crypto-app -- start
pm2 save
```
