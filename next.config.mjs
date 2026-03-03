/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  output: 'standalone',
  
  // 优化生产构建
  swcMinify: true,
  
  // 减少构建时的内存使用
  experimental: {
    // 减少并行编译的worker数量
    workerThreads: false,
    cpus: 1,
  },
  
  // 优化打包
  webpack: (config, { isServer }) => {
    // 减少内存使用
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
        },
      },
    };
    
    return config;
  },
};

export default nextConfig;
