/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.sanity.io',
        },
        {
          protocol: 'https',
          hostname: 'source.unsplash.com',
        },
      ],
      domains: ['res.cloudinary.com'],
    },
    
    async redirects() {
      return [
        {
          source: '/resena-google-maps',
          destination: '/blog/escribe-una-resena-en-google-maps',
          permanent: true,
        },
      ]
    },
    // ...other config settings
  };
  
  module.exports = nextConfig;