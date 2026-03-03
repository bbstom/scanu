#!/bin/bash
# 服务器配置检查脚本

echo "=========================================="
echo "服务器配置检查"
echo "=========================================="
echo ""

# 1. 系统信息
echo "【系统信息】"
echo "操作系统: $(uname -s)"
echo "内核版本: $(uname -r)"
echo "架构: $(uname -m)"
echo ""

# 2. CPU 信息
echo "【CPU 信息】"
echo "CPU 核心数: $(nproc)"
echo "CPU 型号:"
grep "model name" /proc/cpuinfo | head -1 | cut -d: -f2
echo ""

# 3. 内存信息
echo "【内存信息】"
free -h
echo ""

TOTAL_MEM=$(free -m | awk '/^Mem:/ {print $2}')
USED_MEM=$(free -m | awk '/^Mem:/ {print $3}')
FREE_MEM=$(free -m | awk '/^Mem:/ {print $4}')
SWAP_TOTAL=$(free -m | awk '/^Swap:/ {print $2}')
SWAP_USED=$(free -m | awk '/^Swap:/ {print $3}')

echo "总内存: ${TOTAL_MEM}MB"
echo "已使用: ${USED_MEM}MB"
echo "可用: ${FREE_MEM}MB"
echo "Swap 总计: ${SWAP_TOTAL}MB"
echo "Swap 已使用: ${SWAP_USED}MB"
echo ""

# 4. 磁盘信息
echo "【磁盘信息】"
df -h /www/wwwroot/scanu.cc/scanu 2>/dev/null || df -h .
echo ""

# 5. Node.js 信息
echo "【Node.js 信息】"
if command -v node &> /dev/null; then
    echo "Node.js 版本: $(node -v)"
    echo "npm 版本: $(npm -v)"
else
    echo "❌ Node.js 未安装"
fi
echo ""

# 6. 进程信息
echo "【运行中的进程】"
if command -v pm2 &> /dev/null; then
    pm2 list
else
    echo "PM2 未安装"
    ps aux | grep node | grep -v grep
fi
echo ""

# 7. 端口占用
echo "【端口占用情况】"
netstat -tlnp 2>/dev/null | grep :3000 || echo "端口 3000 未被占用"
echo ""

# 8. 构建建议
echo "=========================================="
echo "【构建建议】"
echo "=========================================="
echo ""

if [ "$TOTAL_MEM" -lt 512 ]; then
    echo "⚠️  内存严重不足（< 512MB）"
    echo ""
    echo "强烈建议："
    echo "1. 使用本地构建方案"
    echo "2. 在本地电脑构建后上传"
    echo "3. 服务器只负责运行"
    echo ""
    echo "参考文档："
    echo "- 本地构建完整指南.md"
    echo "- 立即执行-本地构建.txt"
    echo ""
elif [ "$TOTAL_MEM" -lt 1024 ] && [ "$SWAP_TOTAL" -lt 1024 ]; then
    echo "⚠️  内存不足（< 1GB），且 Swap 不足"
    echo ""
    echo "建议："
    echo "1. 创建 2GB Swap 空间"
    echo "2. 使用低内存构建"
    echo ""
    echo "创建 Swap："
    echo "sudo fallocate -l 2G /swapfile"
    echo "sudo chmod 600 /swapfile"
    echo "sudo mkswap /swapfile"
    echo "sudo swapon /swapfile"
    echo ""
    echo "构建命令："
    echo "NODE_OPTIONS='--max-old-space-size=256' npm run build"
    echo ""
elif [ "$TOTAL_MEM" -lt 2048 ]; then
    echo "✅ 内存可用（1-2GB）"
    echo ""
    echo "建议："
    echo "使用低内存构建模式"
    echo ""
    echo "构建命令："
    echo "NODE_OPTIONS='--max-old-space-size=512' npm run build"
    echo ""
else
    echo "✅ 内存充足（> 2GB）"
    echo ""
    echo "可以直接构建："
    echo "npm run build"
    echo ""
fi

# 9. 磁盘空间检查
DISK_AVAIL=$(df -m /www/wwwroot/scanu.cc/scanu 2>/dev/null | awk 'NR==2 {print $4}' || df -m . | awk 'NR==2 {print $4}')
if [ "$DISK_AVAIL" -lt 2048 ]; then
    echo "⚠️  磁盘空间不足（< 2GB）"
    echo ""
    echo "建议清理："
    echo "- 删除旧的日志文件"
    echo "- 清理 npm 缓存: npm cache clean --force"
    echo "- 删除不需要的文件"
    echo ""
fi

echo "=========================================="
echo "检查完成"
echo "=========================================="
