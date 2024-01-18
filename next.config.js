/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.sanity.io',
        },
      ],
    },
    async redirects() {
      return [
        {
          source: '/concurso',
          destination: '/blog/concurso-especial-family-vet-1er-aniversario',
          permanent: true,
        },
      ]
    },
    // ...other config settings
  };
  
  module.exports = nextConfig;