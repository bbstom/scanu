#!/bin/bash
# 终极修复 - 禁用 SWC 编译器

set -e

echo "=========================================="
echo "终极修复 - 禁用 SWC 编译器"
echo "=========================================="
echo ""

cd /www/wwwroot/scanu.cc/scanu || exit 1

echo "问题分析："
echo "- SIGBUS 错误是 SWC 编译器与系统不兼容"
echo "- SWC 是 Rust 编写的，在某些 Linux 系统上有问题"
echo "- 解决方案：使用 Babel 代替 SWC"
echo ""

# 1. 清理所有缓存
echo "1. 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
rm -rf node_modules/.swc
npm cache clean --force
echo "✅ 清理完成"
echo ""

# 2. 确保 .babelrc 存在
echo "2. 配置 Babel..."
if [ ! -f ".babelrc" ]; then
    cat > .babelrc << 'EOF'
{
  "presets": ["next/babel"]
}
EOF
    echo "✅ 创建 .babelrc"
else
    echo "✅ .babelrc 已存在"
fi
echo ""

# 3. 检查 next.config.mjs
echo "3. 检查 Next.js 配置..."
if grep -q "swcMinify: false" next.config.mjs; then
    echo "✅ SWC 已禁用"
else
    echo "⚠️  警告：next.config.mjs 中 swcMinify 应该设置为 false"
fi
echo ""

# 4. 安装 Babel 依赖（如果需要）
echo "4. 检查 Babel 依赖..."
if ! npm list @babel/core > /dev/null 2>&1; then
    echo "安装 Babel 依赖..."
    npm install --save-dev @babel/core
fi
echo "✅ Babel 依赖就绪"
echo ""

# 5. 构建（禁用 SWC）
echo "5. 开始构建（使用 Babel）..."
echo "这可能需要 5-10 分钟，请耐心等待..."
echo ""

# 设置环境变量禁用 SWC
export NEXT_DISABLE_SWC=1
export SWC_BINARY_PATH=/dev/null

# 构建
if npm run build; then
    echo ""
    echo "=========================================="
    echo "✅ 构建成功！"
    echo "=========================================="
    echo ""
    echo "构建文件大小:"
    du -sh .next
    echo ""
    echo "下一步："
    echo "1. 启动应用: npm start"
    echo "2. 或使用 PM2: pm2 start npm --name crypto-app -- start"
    echo "3. 保存配置: pm2 save"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "❌ 构建失败"
    echo "=========================================="
    echo ""
    echo "请尝试以下方案："
    echo ""
    echo "1. 检查系统架构："
    echo "   uname -m"
    echo ""
    echo "2. 检查 Node.js 版本："
    echo "   node -v"
    echo "   (需要 v18 或更高)"
    echo ""
    echo "3. 查看详细错误："
    echo "   npm run build --verbose"
    echo ""
    echo "4. 使用本地构建方案："
    echo "   参考：本地构建完整指南.md"
    echo ""
    exit 1
fi
