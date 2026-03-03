#!/bin/bash
# 服务器端脚本 - 用于接收本地构建的文件

echo "=========================================="
echo "本地构建上传方案 - 服务器端配置"
echo "=========================================="

cd /www/wwwroot/scanu.cc/scanu || exit 1

echo ""
echo "步骤 1: 等待上传 build.tar.gz 文件..."
echo "请在宝塔面板上传 build.tar.gz 到当前目录"
echo ""

# 检查文件是否存在
if [ ! -f "build.tar.gz" ]; then
    echo "❌ 未找到 build.tar.gz 文件"
    echo ""
    echo "请先在本地构建并上传："
    echo "1. 在本地执行: npm run build"
    echo "2. 打包: tar -czf build.tar.gz .next"
    echo "3. 上传到服务器"
    echo ""
    exit 1
fi

echo "✅ 找到 build.tar.gz 文件"
echo ""

# 备份旧的构建（如果存在）
if [ -d ".next" ]; then
    echo "备份旧的构建..."
    mv .next .next.backup.$(date +%Y%m%d_%H%M%S)
fi

# 解压
echo "解压构建文件..."
tar -xzf build.tar.gz

if [ $? -eq 0 ]; then
    echo "✅ 解压成功"
else
    echo "❌ 解压失败"
    exit 1
fi

# 检查 .next 目录
if [ -d ".next" ]; then
    echo "✅ .next 目录存在"
    echo ""
    echo "构建文件大小:"
    du -sh .next
else
    echo "❌ .next 目录不存在"
    exit 1
fi

# 安装生产依赖
echo ""
echo "安装生产依赖..."
npm ci --production --prefer-offline

if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 清理
echo ""
echo "清理临时文件..."
rm -f build.tar.gz

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 启动应用: pm2 start npm --name crypto-app -- start"
echo "2. 保存配置: pm2 save"
echo "3. 设置开机启动: pm2 startup"
echo ""
echo "或直接启动: npm start"
echo ""
