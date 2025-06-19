#!/usr/bin/env node

/**
 * Environment Setup Script for VetForFamily
 * 
 * This script helps configure environment files for:
 * - Production: vetforfamily.com
 * - Development: development.vetforfamily.com
 * 
 * Usage: node scripts/setup-environments.js
 */

const fs = require('fs');
const path = require('path');

// Base configuration shared across environments
const baseConfig = {
  // Auth
  AUTH_SECRET: "your-auth-secret-here",
  
  // Cloudinary (shared)
  CLOUDINARY_API_KEY: "your-cloudinary-api-key",
  CLOUDINARY_API_SECRET: "your-cloudinary-api-secret",
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "your-cloud-name",
  CLOUDINARY_URL: "cloudinary://api-key:api-secret@cloud-name",
  
  // Email
  SEND_API_KEY: "your-sendgrid-api-key",
  
  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "your-google-maps-api-key",
  NEXT_PUBLIC_CALENDAR: "your-calendar-url",
  NEXT_PUBLIC_FACEBOOK_PIXEL_ID: "your-facebook-pixel-id",
  
  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: "your-sanity-project-id",
  NEXT_PUBLIC_SANITY_API_VERSION: "2023-11-19",
  SANITY_API_READ_TOKEN: "your-sanity-read-token",
  
  // Admin
  ADMIN_USERNAME: "administrador",
  ADMIN_PASSWORD: "your-admin-password",
  
  // Kinde Domain (shared)
  KINDE_DOMAIN: "your-domain.kinde.com",
  KINDE_ISSUER_URL: "https://your-domain.kinde.com",
  NEXT_PUBLIC_KINDE_ISSUER_URL: "https://your-domain.kinde.com"
};

// Environment-specific configurations
const environments = {
  development: {
    NODE_ENV: "development",
    NEXTAUTH_URL: "https://development.vetforfamily.com",
    
    // Database - Development
    DATABASE_URL: "your-development-database-url",
    
    // Kinde - Development App (NEEDS TO BE CREATED)
    KINDE_CLIENT_ID: "YOUR_DEV_CLIENT_ID_HERE",
    KINDE_CLIENT_SECRET: "YOUR_DEV_CLIENT_SECRET_HERE",
    KINDE_M2M_CLIENT_ID: "YOUR_DEV_M2M_CLIENT_ID_HERE",
    KINDE_M2M_CLIENT_SECRET: "YOUR_DEV_M2M_CLIENT_SECRET_HERE",
    
    // URLs - Development
    KINDE_SITE_URL: "https://development.vetforfamily.com",
    KINDE_POST_LOGIN_REDIRECT_URL: "https://development.vetforfamily.com/admin",
    KINDE_POST_LOGOUT_REDIRECT_URL: "https://development.vetforfamily.com",
    KINDE_COOKIE_DOMAIN: ".vetforfamily.com",
    
    // Public URLs
    NEXT_PUBLIC_SITE_URL: "https://development.vetforfamily.com",
    NEXT_PUBLIC_APP_URL: "https://development.vetforfamily.com",
    NEXT_PUBLIC_BASE_URL: "https://development.vetforfamily.com",
    
    // Email
    MY_EMAIL: "dev@vetforfamily.com",
    SENDER_EMAIL: "dev@vetforfamily.com",
    NEXT_PUBLIC_EMAIL_ADDRESS: "dev@vetforfamily.com",
    
    // Sanity
    NEXT_PUBLIC_SANITY_DATASET: "development",
    
    // Development specific
    PORT: "3000"
  },
  
  production: {
    NODE_ENV: "production",
    NEXTAUTH_URL: "https://vetforfamily.com",
    
    // Database - Production
    DATABASE_URL: "your-production-database-url",
    
    // Kinde - Production App
    KINDE_CLIENT_ID: "your-production-kinde-client-id",
    KINDE_CLIENT_SECRET: "your-production-kinde-client-secret",
    KINDE_M2M_CLIENT_ID: "your-production-m2m-client-id",
    KINDE_M2M_CLIENT_SECRET: "your-production-m2m-client-secret",
    
    // URLs - Production
    KINDE_SITE_URL: "https://vetforfamily.com",
    KINDE_POST_LOGIN_REDIRECT_URL: "https://vetforfamily.com/admin",
    KINDE_POST_LOGOUT_REDIRECT_URL: "https://vetforfamily.com",
    KINDE_COOKIE_DOMAIN: ".vetforfamily.com",
    
    // Public URLs
    NEXT_PUBLIC_SITE_URL: "https://vetforfamily.com",
    NEXT_PUBLIC_APP_URL: "https://vetforfamily.com",
    NEXT_PUBLIC_BASE_URL: "https://vetforfamily.com",
    
    // Email
    MY_EMAIL: "contacto@vetforfamily.com",
    SENDER_EMAIL: "contacto@vetforfamily.com",
    NEXT_PUBLIC_EMAIL_ADDRESS: "contacto@vetforfamily.com",
    
    // Sanity
    NEXT_PUBLIC_SANITY_DATASET: "production"
  }
};

function generateEnvFile(envName, config) {
  const envContent = `# ======================
# ENV's Configuration - ${envName.toUpperCase()} ENVIRONMENT
# ======================
# Created by Alanis Web
# Domain: ${envName === 'production' ? 'vetforfamily.com' : 'development.vetforfamily.com'}
# Generated: ${new Date().toISOString()}

# ======================
# Core Application Configuration
# ======================
NODE_ENV="${config.NODE_ENV}"
NEXTAUTH_URL="${config.NEXTAUTH_URL}"
AUTH_SECRET="${config.AUTH_SECRET}"

# ======================
# Database Configuration
# ======================
DATABASE_URL="${config.DATABASE_URL}"

# ======================
# Authentication Providers - KINDE
# ======================
KINDE_DOMAIN="${baseConfig.KINDE_DOMAIN}"
KINDE_ISSUER_URL="${baseConfig.KINDE_ISSUER_URL}"
KINDE_CLIENT_ID="${config.KINDE_CLIENT_ID}"
KINDE_CLIENT_SECRET="${config.KINDE_CLIENT_SECRET}"
KINDE_M2M_CLIENT_ID="${config.KINDE_M2M_CLIENT_ID}"
KINDE_M2M_CLIENT_SECRET="${config.KINDE_M2M_CLIENT_SECRET}"

# URLs Configuration
KINDE_SITE_URL="${config.KINDE_SITE_URL}"
KINDE_POST_LOGIN_REDIRECT_URL="${config.KINDE_POST_LOGIN_REDIRECT_URL}"
KINDE_POST_LOGOUT_REDIRECT_URL="${config.KINDE_POST_LOGOUT_REDIRECT_URL}"
KINDE_COOKIE_DOMAIN="${config.KINDE_COOKIE_DOMAIN}"

# ======================
# Cloudinary Configuration
# ======================
CLOUDINARY_API_KEY="${baseConfig.CLOUDINARY_API_KEY}"
CLOUDINARY_API_SECRET="${baseConfig.CLOUDINARY_API_SECRET}"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="${baseConfig.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}"
CLOUDINARY_URL="${baseConfig.CLOUDINARY_URL}"

# ======================
# Email Configuration
# ======================
MY_EMAIL="${config.MY_EMAIL}"
SENDER_EMAIL="${config.SENDER_EMAIL}"
SEND_API_KEY="${baseConfig.SEND_API_KEY}"

# ======================
# Client-Side Environment Variables
# ======================
NEXT_PUBLIC_SITE_URL="${config.NEXT_PUBLIC_SITE_URL}"
NEXT_PUBLIC_APP_URL="${config.NEXT_PUBLIC_APP_URL}"
NEXT_PUBLIC_BASE_URL="${config.NEXT_PUBLIC_BASE_URL}"
NEXT_PUBLIC_KINDE_ISSUER_URL="${baseConfig.NEXT_PUBLIC_KINDE_ISSUER_URL}"
NEXT_PUBLIC_EMAIL_ADDRESS="${config.NEXT_PUBLIC_EMAIL_ADDRESS}"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="${baseConfig.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}"
NEXT_PUBLIC_CALENDAR="${baseConfig.NEXT_PUBLIC_CALENDAR}"
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="${baseConfig.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}"

# ======================
# Sanity CMS Configuration
# ======================
NEXT_PUBLIC_SANITY_PROJECT_ID="${baseConfig.NEXT_PUBLIC_SANITY_PROJECT_ID}"
NEXT_PUBLIC_SANITY_DATASET="${config.NEXT_PUBLIC_SANITY_DATASET}"
NEXT_PUBLIC_SANITY_API_VERSION="${baseConfig.NEXT_PUBLIC_SANITY_API_VERSION}"
SANITY_API_READ_TOKEN="${baseConfig.SANITY_API_READ_TOKEN}"

# ======================
# Admin Credentials (Keep Secure!)
# ======================
ADMIN_USERNAME="${baseConfig.ADMIN_USERNAME}"
ADMIN_PASSWORD="${baseConfig.ADMIN_PASSWORD}"

${config.PORT ? `# ======================\n# Development Specific\n# ======================\nPORT="${config.PORT}"` : ''}
`;

  return envContent;
}

function main() {
  console.log('🚀 Setting up VetForFamily environments...\n');
  
  // Create environment files
  Object.entries(environments).forEach(([envName, envConfig]) => {
    const fileName = `.env.${envName}`;
    const filePath = path.join(process.cwd(), fileName);
    const content = generateEnvFile(envName, envConfig);
    
    try {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Created ${fileName}`);
    } catch (error) {
      console.error(`❌ Error creating ${fileName}:`, error.message);
    }
  });
  
  console.log('\n📋 Next Steps:');
  console.log('1. 🔑 Create a new Kinde application for development environment');
  console.log('2. 📝 Update .env.development with the new Kinde credentials');
  console.log('3. 🗄️  Set up separate databases if needed');
  console.log('4. 🧪 Test both environments');
  
  console.log('\n🔧 Kinde Setup Instructions:');
  console.log('1. Go to https://vetfamily.kinde.com/admin');
  console.log('2. Create a new application for development');
  console.log('3. Set the callback URLs to:');
  console.log('   - https://development.vetforfamily.com/api/auth/kinde_callback');
  console.log('   - https://development.vetforfamily.com/api/auth/logout');
  console.log('4. Copy the credentials to .env.development');
  
  console.log('\n🚀 Usage:');
  console.log('- Development: pnpm run dev:staging');
  console.log('- Production: pnpm run start:production');
}

if (require.main === module) {
  main();
}

module.exports = { generateEnvFile, environments, baseConfig }; 