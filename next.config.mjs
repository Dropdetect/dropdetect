/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // Skip API routes during build
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === 'production' && isServer) {
      // Skip API routes during build
      config.externals = [...config.externals, 'prisma', '@prisma/client'];
    }
    return config;
  }
}

export default nextConfig