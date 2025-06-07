/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration
  eslint: {
    dirs: [
      'app',
      'components', 
      'lib', 
      'utils',
      'hooks',     // Add if you have custom hooks
      'types',     // Add if you have custom type definitions
      'context',   // Add if you have context files
      'services'   // Add if you have service files
    ],
    ignoreDuringBuilds: false, // Fail build if there are ESLint errors
  },

  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Images configuration (your existing config is good)
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

  // Cache control (your existing config is good)
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

  // Redirects (your existing config is good)
  async redirects() {
    return [
      {
        source: "/resena-google-maps",
        destination: "/blog/escribe-una-resena-en-google-maps",
        permanent: true,
      },
    ];
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true, // Add gzip compression
  reactStrictMode: true, // Recommended for better development experience

  // Next.js 15 experimental features
  experimental: {
    // Enable React 19 features
    reactCompiler: false, // Set to true if you want to use React Compiler
    // Partial Prerendering is stable in Next.js 15
    ppr: false, // Enable if you want to use Partial Prerendering
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
    // Add type checking during build
    tsconfigPath: './tsconfig.json',
  },
};

module.exports = nextConfig;