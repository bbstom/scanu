@echo off
chcp 65001 >nul
echo ==========================================
echo 本地构建脚本 - Windows
echo ==========================================
echo.

REM 检查是否在项目目录
if not exist "package.json" (
    echo ❌ 错误：未找到 package.json
    echo 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo ✅ 找到项目文件
echo.

REM 检查 node_modules
if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
)

REM 清理旧的构建
echo 🧹 清理旧的构建文件...
if exist ".next" rmdir /s /q .next
if exist "build.tar.gz" del /f /q build.tar.gz
echo ✅ 清理完成
echo.

REM 构建项目
echo 🔨 开始构建项目...
echo 这可能需要几分钟，请耐心等待...
echo.
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ 构建失败
    echo.
    echo 请检查错误信息并修复后重试
    pause
    exit /b 1
)

echo.
echo ✅ 构建成功！
echo.

REM 检查 .next 目录
if not exist ".next" (
    echo ❌ 错误：.next 目录不存在
    pause
    exit /b 1
)

REM 打包构建文件
echo 📦 打包构建文件...
echo.

REM 使用 PowerShell 创建压缩包（Windows 自带）
powershell -Command "Compress-Archive -Path '.next', 'package.json', 'package-lock.json', 'public', 'next.config.mjs' -DestinationPath 'build.zip' -Force"

if errorlevel 1 (
    echo ❌ 打包失败
    echo.
    echo 请手动打包以下文件：
    echo - .next 目录
    echo - package.json
    echo - package-lock.json
    echo - public 目录
    echo - next.config.mjs
    pause
    exit /b 1
)

echo ✅ 打包完成：build.zip
echo.

REM 显示文件信息
echo 📊 构建文件信息：
dir /s .next | find "个文件"
echo.
for %%A in (build.zip) do echo 压缩包大小: %%~zA 字节
echo.

echo ==========================================
echo ✅ 本地构建完成！
echo ==========================================
echo.
echo 📝 下一步操作：
echo.
echo 1. 上传 build.zip 到服务器
echo    路径：/www/wwwroot/scanu.cc/scanu
echo.
echo 2. 在服务器上解压：
echo    unzip build.zip
echo.
echo 3. 安装生产依赖：
echo    npm ci --production
echo.
echo 4. 启动应用：
echo    pm2 start npm --name crypto-app -- start
echo    pm2 save
echo.
echo 或者使用宝塔面板上传并解压
echo.
pause
