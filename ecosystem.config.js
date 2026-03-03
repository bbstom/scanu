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
      NODE_ENV: 'production',
      PORT: 3001,
      HOSTNAME: '0.0.0.0',
      MONGODB_URI: 'mongodb://root:Ubuntu123!@172.16.254.100:27017/crypto-wallet-explorer?authSource=admin',
      REDIS_URL: 'redis://localhost:6379',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
      NEXT_PUBLIC_BASE_URL: 'http://localhost:3001'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
  }]
};
