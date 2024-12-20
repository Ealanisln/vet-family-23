/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },

  // Headers para control de caché
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/resena-google-maps",
        destination: "/blog/escribe-una-resena-en-google-maps",
        permanent: true,
      },
    ];
  },

  // Optimizaciones de rendimiento
  poweredByHeader: false,
  swcMinify: true,

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
