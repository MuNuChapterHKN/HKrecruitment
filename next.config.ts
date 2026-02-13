import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/recruitment',
  output: 'standalone',
  experimental: {
    authInterrupts: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/signin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
