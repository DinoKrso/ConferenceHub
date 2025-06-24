/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Or remove this typescript block entirely
  },
  images: {
    domains: ['i.ibb.co', 'via.placeholder.com'],
    unoptimized: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY,
  },
}

export default nextConfig
