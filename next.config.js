/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mejora en la organización de images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '**',  // Añadido para ser más específico
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '**',  // Añadido para ser más específico
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',  // Añadido para ser más específico
      }
    ],
    // Eliminamos domains ya que está cubierto en remotePatterns
  },

  // Mejoras en redirects
  async redirects() {
    return [
      {
        source: '/resena-google-maps',
        destination: '/blog/escribe-una-resena-en-google-maps',
        permanent: true,
        // Opcionalmente podrías añadir:
        // basePath: false,
        // locale: false,
      },
    ]
  },

  // Recomendado añadir para mejor rendimiento
  poweredByHeader: false,

  // Opcional: Si usas TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Opcional: Para mejorar el rendimiento en producción
  swcMinify: true,
};

module.exports = nextConfig;