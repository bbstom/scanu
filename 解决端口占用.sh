#!/bin/bash
# 解决端口占用问题

echo "=========================================="
echo "检查端口 3000 占用情况"
echo "=========================================="
echo ""

# 查看占用端口 3000 的进程
echo "1. 查找占用端口 3000 的进程..."
PORT_PID=$(lsof -ti :3000 2>/dev/null || netstat -tlnp 2>/dev/null | grep :3000 | awk '{print $7}' | cut -d'/' -f1)

if [ -z "$PORT_PID" ]; then
    echo "✅ 端口 3000 未被占用"
else
    echo "⚠️  端口 3000 被以下进程占用："
    echo ""
    lsof -i :3000 2>/dev/null || netstat -tlnp 2>/dev/null | grep :3000
    echo ""
    
    # 询问是否杀死进程
    echo "是否杀死占用端口的进程？(y/n)"
    read -t 10 -p "10秒后自动选择 y: " KILL_PROCESS || KILL_PROCESS="y"
    
    if [ "$KILL_PROCESS" = "y" ]; then
        echo ""
        echo "2. 杀死占用端口的进程..."
        kill -9 $PORT_PID 2>/dev/null
        
        # 等待一秒
        sleep 1
        
        # 再次检查
        if lsof -i :3000 >/dev/null 2>&1; then
            echo "❌ 进程仍在运行，尝试强制杀死..."
            killall -9 node 2>/dev/null
        else
            echo "✅ 进程已杀死"
        fi
    else
        echo "跳过杀死进程"
    fi
fi

echo ""
echo "=========================================="
echo "检查 PM2 进程"
echo "=========================================="
echo ""

# 检查 PM2 进程
if command -v pm2 &> /dev/null; then
    echo "PM2 进程列表："
    pm2 list
    echo ""
    
    # 检查是否有 crypto-app
    if pm2 list | grep -q "crypto-app"; then
        echo "⚠️  发现 PM2 中已有 crypto-app 进程"
        echo ""
        echo "是否重启 crypto-app？(y/n)"
        read -t 10 -p "10秒后自动选择 y: " RESTART_PM2 || RESTART_PM2="y"
        
        if [ "$RESTART_PM2" = "y" ]; then
            echo ""
            echo "重启 crypto-app..."
            pm2 restart crypto-app
            echo "✅ 已重启"
        fi
    else
        echo "✅ PM2 中没有 crypto-app 进程"
        echo ""
        echo "建议使用 PM2 启动："
        echo "pm2 start npm --name crypto-app -- start"
    fi
else
    echo "PM2 未安装"
    echo ""
    echo "安装 PM2："
    echo "npm install -g pm2"
fi

echo ""
echo "=========================================="
echo "当前端口占用情况"
echo "=========================================="
echo ""
netstat -tlnp 2>/dev/null | grep :3000 || echo "端口 3000 空闲"

echo ""
echo "=========================================="
echo "建议操作"
echo "=========================================="
echo ""
echo "1. 使用 PM2 启动（推荐）："
echo "   pm2 start npm --name crypto-app -- start"
echo "   pm2 save"
echo ""
echo "2. 或使用其他端口："
echo "   PORT=3001 npm start"
echo ""
echo "3. 或直接启动（前台运行）："
echo "   npm start"
echo ""
