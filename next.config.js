/** @type {import('next').NextConfig} */

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Domain configuration based on environment
const getDomainConfig = () => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const nodeEnv = process.env.NODE_ENV;
  
  // Force localhost detection for development
  if (nodeEnv === 'development' || !siteUrl || siteUrl.includes('localhost')) {
    return {
      domain: 'localhost:3000',
      environment: 'local',
      isStaging: false
    };
  } else if (siteUrl?.includes('development.vetforfamily.com')) {
    return {
      domain: 'development.vetforfamily.com',
      environment: 'development',
      isStaging: true
    };
  } else if (siteUrl?.includes('vetforfamily.com')) {
    return {
      domain: 'vetforfamily.com',
      environment: 'production',
      isStaging: false
    };
  } else {
    return {
      domain: 'localhost:3000',
      environment: 'local',
      isStaging: false
    };
  }
};

const domainConfig = getDomainConfig();

const nextConfig = {
  // Environment variables with dynamic Kinde URLs
  env: {
    DOMAIN_CONFIG: JSON.stringify(domainConfig),
    // Dynamic Kinde URLs to fix state cookie issues
    KINDE_SITE_URL: process.env.KINDE_SITE_URL ?? (
      process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000'
    ),
    KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL ?? (
      process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}/admin` 
        : 'http://localhost:3000/admin'
    ),
    KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL ?? (
      process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000'
    ),
  },

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

  // Images configuration
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

  // Cache control with environment-specific settings
  async headers() {
    const headers = [
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

    // Add security headers for production
    if (isProduction) {
      headers.push({
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      });
    }

    return headers;
  },

  // Redirects with environment awareness
  async redirects() {
    const redirects = [
      {
        source: "/resena-google-maps",
        destination: "/blog/escribe-una-resena-en-google-maps",
        permanent: true,
      },
    ];

    // Add www redirect for production domain
    if (domainConfig.domain === 'vetforfamily.com') {
      redirects.push({
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.vetforfamily.com",
          },
        ],
        destination: "https://vetforfamily.com/:path*",
        permanent: true,
      });
    }

    return redirects;
  },

  // Performance optimizations
  poweredByHeader: false,
  swcMinify: true,
  compress: true,
  reactStrictMode: true,

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // Output configuration for different environments
  output: isProduction ? 'standalone' : undefined,

  // Experimental features
  experimental: {
    // Enable if using app directory features
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: isDevelopment,
    },
  },
};

// Log environment info during build
console.log(`🚀 Building for ${domainConfig.environment} environment`);
console.log(`📍 Domain: ${domainConfig.domain}`);
console.log(`🔧 Staging: ${domainConfig.isStaging}`);

module.exports = nextConfig;