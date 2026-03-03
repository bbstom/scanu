#!/bin/bash
# 修复 Bus error 构建问题

set -e

echo "=========================================="
echo "修复 Bus error 构建问题"
echo "=========================================="
echo ""

cd /www/wwwroot/scanu.cc/scanu || exit 1

# 1. 检查系统信息
echo "1. 检查系统信息..."
echo "内存信息:"
free -h
echo ""
echo "磁盘信息:"
df -h .
echo ""

# 2. 清理所有缓存和临时文件
echo "2. 清理缓存和临时文件..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
npm cache clean --force
echo "✅ 清理完成"
echo ""

# 3. 检查 Node.js 版本
echo "3. 检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "Node.js 版本: $(node -v)"

if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  警告：Node.js 版本过低，建议升级到 v18 或更高"
fi
echo ""

# 4. 重新安装依赖
echo "4. 重新安装依赖..."
rm -rf node_modules package-lock.json
npm install
echo "✅ 依赖安装完成"
echo ""

# 5. 尝试构建
echo "5. 开始构建..."
echo "使用标准配置构建..."
echo ""

# 尝试不同的构建方式
BUILD_SUCCESS=0

# 方法 1: 标准构建
echo "尝试方法 1: 标准构建"
if npm run build; then
    BUILD_SUCCESS=1
    echo "✅ 构建成功！"
else
    echo "❌ 方法 1 失败"
    echo ""
    
    # 方法 2: 禁用 SWC
    echo "尝试方法 2: 禁用 SWC 编译器"
    rm -rf .next
    if NEXT_DISABLE_SWC=1 npm run build; then
        BUILD_SUCCESS=1
        echo "✅ 构建成功！（禁用 SWC）"
    else
        echo "❌ 方法 2 失败"
        echo ""
        
        # 方法 3: 使用 Babel
        echo "尝试方法 3: 强制使用 Babel"
        rm -rf .next
        if SWC_BINARY_PATH=/dev/null npm run build; then
            BUILD_SUCCESS=1
            echo "✅ 构建成功！（使用 Babel）"
        else
            echo "❌ 方法 3 失败"
        fi
    fi
fi

echo ""

if [ $BUILD_SUCCESS -eq 1 ]; then
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
    echo ""
else
    echo "=========================================="
    echo "❌ 所有构建方法都失败了"
    echo "=========================================="
    echo ""
    echo "可能的原因："
    echo "1. SWC 编译器与系统不兼容"
    echo "2. 磁盘空间不足"
    echo "3. 系统架构问题"
    echo ""
    echo "建议："
    echo "1. 检查系统架构: uname -m"
    echo "2. 检查磁盘空间: df -h"
    echo "3. 查看详细错误日志"
    echo "4. 或使用本地构建方案"
    echo ""
fi
