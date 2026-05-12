/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/Client-1',
  webpack: (config, { isServer }) => {
    if (isServer && config.output) {
      config.output.chunkFilename = 'chunks/[name].js';
    }

    return config;
  },
};

export default nextConfig;
