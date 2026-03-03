#!/bin/bash
# 一键部署脚本 - 最简单的部署方式

echo "🚀 开始一键部署..."
echo ""

# 进入项目目录
cd /www/wwwroot/scanu.cc/scanu || exit 1

# 创建 Swap（如果不存在）
if [ ! -f /swapfile ]; then
    echo "📦 创建 Swap 空间..."
    sudo fallocate -l 2G /swapfile && \
    sudo chmod 600 /swapfile && \
    sudo mkswap /swapfile && \
    sudo swapon /swapfile && \
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap 创建完成"
fi

# 清理
echo ""
echo "🧹 清理旧文件..."
rm -rf .next

# 构建（低内存模式）
echo ""
echo "🔨 开始构建（低内存模式）..."
NODE_OPTIONS='--max-old-space-size=512' npm run build

# 检查构建结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功！"
    echo ""
    echo "📝 下一步："
    echo "   启动应用: npm start"
    echo "   或使用 PM2: pm2 start npm --name crypto-app -- start"
else
    echo ""
    echo "❌ 构建失败"
    echo ""
    echo "💡 尝试使用更小的内存："
    echo "   NODE_OPTIONS='--max-old-space-size=256' npm run build"
    exit 1
fi
