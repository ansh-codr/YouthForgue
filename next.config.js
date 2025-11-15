/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: 'export' - Netlify supports Next.js natively with dynamic routes
  // Static export doesn't work well with dynamic routes like /projects/[slugOrId]
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
