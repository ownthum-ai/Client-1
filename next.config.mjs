/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Client-1',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
