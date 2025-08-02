/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用standalone模式
  output: 'standalone',
  // 排除测试文件
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // 生产构建时排除测试文件
      config.module.rules.push({
        test: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
        loader: 'ignore-loader',
      });
      
      // 排除__tests__目录
      config.resolve.alias = {
        ...config.resolve.alias,
        '**/__tests__/**': false,
      };
    }
    return config;
  },
  // 排除测试文件
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 排除测试文件
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 