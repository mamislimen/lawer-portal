/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure page extensions to include TypeScript and JavaScript files
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Configure webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
      };
    }
    return config;
  },
  
  // Configure images
  images: {
    domains: ['localhost'],
  },
  
  // Server Actions are enabled by default in Next.js 14+
};

module.exports = nextConfig;
