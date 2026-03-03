module.exports = {
  apps: [{
    name: 'crypto-app',
    cwd: '/www/wwwroot/scanu.cc/scanu',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
        # 端口配置
        PORT=3001
        HOSTNAME=0.0.0.0
        
        # MongoDB 数据库配置
        
        # 格式说明：
        # 1. 无认证: mongodb://localhost:27017/crypto-wallet-explorer
        # 2. 有认证: mongodb://用户名:密码@localhost:27017/crypto-wallet-explorer?authSource=admin
        # 3. MongoDB Atlas: mongodb+srv://用户名:密码@cluster.mongodb.net/crypto-wallet-explorer?retryWrites=true&w=majority
        # 4. 远程数据库: mongodb://用户名:密码@服务器IP:27017/crypto-wallet-explorer?authSource=admin
        
        # 示例（请根据实际情况修改）：

        
        # Redis（可选，用于缓存）
        REDIS_URL=redis://localhost:6379
        # 如果 Redis 有密码: redis://:密码@localhost:6379
        # 禁用 Redis 缓存（如果不想使用缓存）: REDIS_ENABLED=false
        REDIS_ENABLED=true
        
        # 管理员初始化密钥（重要！生产环境必须设置）
        # 只有知道这个密钥的人才能创建管理员账号
        # 留空则任何人都可以创建（仅适用于开发环境）
        ADMIN_SETUP_KEY=demopo1234
        
        # 自定义管理后台路径（可选，增强安全性）
        # 默认: /admin
        # 示例: /my-secret-admin-panel
        # ADMIN_PATH=/admin
        ADMIN_PATH=/demopo
        
        # API Keys（可选 - 可以在后台管理界面配置）
        # 如果在这里配置，会优先使用这里的配置
        # ETHERSCAN_API_KEY=your_etherscan_api_key
        # TRONGRID_API_KEY=your_trongrid_api_key
        # COINGECKO_API_KEY=your_coingecko_api_key
        
        # 应用配置
        NEXT_PUBLIC_APP_URL=http://localhost:3001
        NEXT_PUBLIC_BASE_URL=http://localhost:3001
        NODE_ENV=development
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};
