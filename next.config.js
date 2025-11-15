/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    domains: [
      'res.cloudinary.com',
      'ui-avatars.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
  },
  // Ensure trailing slashes for better compatibility
  trailingSlash: true,
};

module.exports = nextConfig;
