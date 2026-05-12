/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer && config.output) {
      config.output.chunkFilename = 'chunks/[name].js';
    }

    return config;
  },
};

export default nextConfig;
