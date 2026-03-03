# Bus Error 真正原因分析

## 问题分析

你说得对，2GB 内存应该足够构建。Bus error 通常不是简单的内存不足，而是：

### 可能的原因

1. **SWC 编译器问题**（最可能）
   - Next.js 14 默认使用 Rust 编写的 SWC 编译器
   - SWC 在某些 Linux 系统上可能不兼容
   - 特别是在虚拟化环境（VPS）中

2. **系统架构不匹配**
   - SWC 二进制文件可能与系统架构不匹配
   - ARM vs x86_64 架构问题

3. **磁盘 I/O 问题**
   - 虚拟化环境的磁盘 I/O 限制
   - 文件系统问题

4. **我添加的错误配置**
   - `workerThreads: false` 可能导致问题
   - 过度优化的 webpack 配置

## 已修复

我已经恢复了 `next.config.mjs` 到简洁配置，移除了可能导致问题的实验性配置。

---

## 立即尝试的解决方案

### 方案 1：清理后重新构建（推荐）

```bash
cd /www/wwwroot/scanu.cc/scanu

# 清理所有缓存
rm -rf .next node_modules/.cache .swc
npm cache clean --force

# 重新构建
npm run build
```

### 方案 2：使用修复脚本

```bash
cd /www/wwwroot/scanu.cc/scanu
bash 修复构建问题.sh
```

这个脚本会自动尝试多种构建方式。

### 方案 3：禁用 SWC 编译器

如果是 SWC 的问题，可以禁用它：

```bash
cd /www/wwwroot/scanu.cc/scanu
rm -rf .next

# 禁用 SWC，使用 Babel
NEXT_DISABLE_SWC=1 npm run build
```

### 方案 4：检查系统架构

```bash
# 查看系统架构
uname -m

# 查看 Node.js 架构
node -p "process.arch"

# 如果不匹配，可能需要重新安装 Node.js
```

---

## 诊断命令

### 检查系统信息

```bash
# 内存
free -h

# 磁盘
df -h

# CPU 架构
uname -a

# Node.js 版本
node -v
npm -v
```

### 查看详细错误

```bash
# 使用详细模式构建
npm run build --verbose

# 或
DEBUG=* npm run build
```

---

## 如果还是失败

### 检查 SWC 兼容性

```bash
# 测试 SWC 是否工作
node -e "console.log(require('@next/swc-linux-x64-gnu'))"

# 如果报错，说明 SWC 不兼容
```

### 强制使用 Babel

创建 `.babelrc` 文件：

```json
{
  "presets": ["next/babel"]
}
```

然后重新构建：

```bash
npm run build
```

---

## 常见的 Bus Error 原因

### 1. SWC 二进制不兼容

**症状：**
```
Bus error (core dumped)
Creating an optimized production build ...
```

**解决：**
```bash
NEXT_DISABLE_SWC=1 npm run build
```

### 2. 内存对齐问题

**症状：**
- 在特定的虚拟化环境中发生
- 随机崩溃

**解决：**
```bash
# 使用单线程构建
NODE_OPTIONS='--max-old-space-size=1024' npm run build
```

### 3. 磁盘空间不足

**症状：**
```
Bus error
ENOSPC: no space left on device
```

**解决：**
```bash
# 清理空间
npm cache clean --force
rm -rf node_modules/.cache
```

---

## 推荐的构建命令

### 标准构建（先试这个）

```bash
cd /www/wwwroot/scanu.cc/scanu
rm -rf .next
npm run build
```

### 如果失败，禁用 SWC

```bash
rm -rf .next
NEXT_DISABLE_SWC=1 npm run build
```

### 如果还失败，使用低内存模式

```bash
rm -rf .next
NODE_OPTIONS='--max-old-space-size=1024' npm run build
```

---

## 验证修复

构建成功后，你应该看到：

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (XX/XX)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X.XX kB        XX.X kB
...
```

---

## 总结

1. ✅ 已修复 `next.config.mjs` 配置
2. ✅ 创建了自动修复脚本
3. ✅ 提供了多种构建方案

现在请执行：

```bash
cd /www/wwwroot/scanu.cc/scanu
bash 修复构建问题.sh
```

这个脚本会自动尝试所有可能的解决方案。
