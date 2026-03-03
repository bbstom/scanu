#!/bin/bash

# 生产环境部署脚本
# 适用于内存受限的服务器（如宝塔面板）

set -e

echo "=========================================="
echo "开始部署到生产环境"
echo "=========================================="

# 1. 检查系统资源
echo ""
echo "1. 检查系统资源..."
echo "内存使用情况:"
free -h
echo ""
echo "磁盘使用情况:"
df -h .
echo ""

# 2. 检查并创建 Swap（如果需要）
SWAP_SIZE=$(free -m | awk '/^Swap:/ {print $2}')
if [ "$SWAP_SIZE" -lt 1024 ]; then
    echo "2. 检测到 Swap 空间不足，正在创建 2GB Swap..."
    
    if [ ! -f /swapfile ]; then
        sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        
        # 设置开机自动挂载
        if ! grep -q '/swapfile' /etc/fstab; then
            echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        fi
        
        # 优化 Swap 使用
        sudo sysctl vm.swappiness=10
        if ! grep -q 'vm.swappiness' /etc/sysctl.conf; then
            echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
        fi
        
        echo "✓ Swap 创建成功"
    else
        echo "✓ Swap 文件已存在"
        sudo swapon /swapfile 2>/dev/null || echo "Swap 已启用"
    fi
else
    echo "2. ✓ Swap 空间充足 (${SWAP_SIZE}MB)"
fi

echo ""
echo "当前内存状态:"
free -h

# 3. 清理旧的构建文件
echo ""
echo "3. 清理旧的构建文件..."
rm -rf .next
rm -rf node_modules/.cache
echo "✓ 清理完成"

# 4. 安装依赖
echo ""
echo "4. 安装依赖..."
npm ci --prefer-offline --no-audit
echo "✓ 依赖安装完成"

# 5. 构建项目
echo ""
echo "5. 开始构建项目（这可能需要几分钟）..."
echo "使用低内存模式构建..."

# 设置环境变量以减少内存使用
export NODE_OPTIONS="--max-old-space-size=512"
export NEXT_TELEMETRY_DISABLED=1

# 执行构建
npm run build

if [ $? -eq 0 ]; then
    echo "✓ 构建成功！"
else
    echo "✗ 构建失败"
    echo ""
    echo "如果构建失败，请尝试以下方案："
    echo "1. 增加服务器内存"
    echo "2. 在本地构建后上传 .next 目录"
    echo "3. 使用更小的内存限制: NODE_OPTIONS='--max-old-space-size=256' npm run build"
    exit 1
fi

# 6. 检查构建结果
echo ""
echo "6. 检查构建结果..."
if [ -d ".next" ]; then
    echo "✓ .next 目录存在"
    echo "构建文件大小:"
    du -sh .next
else
    echo "✗ .next 目录不存在，构建可能失败"
    exit 1
fi

# 7. 清理开发依赖（可选）
echo ""
echo "7. 是否清理开发依赖以节省空间？(y/n)"
read -t 10 -p "10秒后自动跳过: " CLEAN_DEV || CLEAN_DEV="n"
if [ "$CLEAN_DEV" = "y" ]; then
    echo "清理开发依赖..."
    npm prune --production
    echo "✓ 开发依赖已清理"
else
    echo "跳过清理"
fi

# 8. 完成
echo ""
echo "=========================================="
echo "✓ 部署完成！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 启动应用: npm start"
echo "2. 或使用 PM2: pm2 start npm --name crypto-app -- start"
echo "3. 查看日志: pm2 logs crypto-app"
echo ""
echo "应用将运行在: http://localhost:3000"
echo ""
