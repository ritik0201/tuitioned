/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Use a generic path for the script that won't be blocked
        source: '/js/script.js',
        destination: '/_vercel/speed-insights/script.js',
      },
      {
        // Use a generic path for the data endpoint
        source: '/api/send-vitals',
        destination: '/_vercel/speed-insights/vitals',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.vecteezy.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;