import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Catalog images come from arbitrary external hosts (superkicks, cloudinary,
    // unsplash, etc.). Allow any https source so next/image never silently
    // fails to render a product photo.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  compress: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@phosphor-icons/react',
      'react-icons',
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
