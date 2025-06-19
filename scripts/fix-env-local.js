const fs = require('fs');
const path = require('path');

const envContent = `# ======================
# ENV's Configuration
# ======================
# Created by Alanis Web

# ======================
# Core Application Configuration
# ======================
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your-auth-secret-here"

# ======================
# Database Configuration
# ======================
# Local Development (PostgreSQL)
DATABASE_URL="your-database-url-here"

# ======================
# Authentication Providers - Kinde Configuration
# ======================
KINDE_CLIENT_ID="your-kinde-client-id"
KINDE_CLIENT_SECRET="your-kinde-client-secret"
KINDE_ISSUER_URL="https://your-domain.kinde.com"
KINDE_SITE_URL="http://localhost:3000"
KINDE_POST_LOGOUT_REDIRECT_URL="http://localhost:3000"
KINDE_POST_LOGIN_REDIRECT_URL="http://localhost:3000/admin"

# M2M Configuration
KINDE_M2M_CLIENT_ID="your-m2m-client-id"
KINDE_M2M_CLIENT_SECRET="your-m2m-client-secret"

# ======================
# Cloudinary Configuration
# ======================
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_URL="cloudinary://api-key:api-secret@cloud-name"

# ======================
# Email Configuration
# ======================
MY_EMAIL="your-email@example.com"
SEND_API_KEY="your-sendgrid-api-key"

# ======================
# Client-Side Environment Variables
# ======================
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_KINDE_ISSUER_URL="https://your-domain.kinde.com"
NEXT_PUBLIC_EMAIL_ADDRESS="dev@localhost"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
NEXT_PUBLIC_CALENDAR="your-calendar-url"
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="your-facebook-pixel-id"

# ======================
# Sanity CMS Configuration
# ======================
NEXT_PUBLIC_SANITY_PROJECT_ID="your-sanity-project-id"
NEXT_PUBLIC_SANITY_DATASET="development"
SANITY_API_READ_TOKEN="your-sanity-read-token"

# ======================
# Admin Credentials (Keep Secure!)
# ======================
ADMIN_USERNAME="administrador"
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local updated successfully!');
  console.log('🔧 Removed KINDE_DOMAIN and simplified configuration');
  console.log('🚀 Now restart the dev server and try the login again');
  console.log('⚠️  Remember to replace placeholder values with actual credentials');
} catch (error) {
  console.error('❌ Error updating .env.local:', error);
} 