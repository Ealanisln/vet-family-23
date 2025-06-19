# Environment Setup Guide

## ⚠️ Important Security Notice

This repository has been cleaned of all sensitive credentials. All environment files with real API keys, database URLs, and secrets have been removed from git tracking.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual credentials** in `.env.local`

3. **Never commit environment files** - they are already in `.gitignore`

## Environment Files

- `.env.example` - Template with placeholder values (safe to commit)
- `.env.local` - Your local development environment (DO NOT COMMIT)
- `.env.development` - Development server environment (DO NOT COMMIT)
- `.env.production` - Production environment (DO NOT COMMIT)

## Required Environment Variables

### Core Application
- `NEXTAUTH_URL` - Your application URL
- `AUTH_SECRET` - Secret for NextAuth.js

### Database
- `DATABASE_URL` - PostgreSQL connection string

### Kinde Authentication
- `KINDE_CLIENT_ID` - Your Kinde client ID
- `KINDE_CLIENT_SECRET` - Your Kinde client secret
- `KINDE_ISSUER_URL` - Your Kinde domain URL
- `KINDE_M2M_CLIENT_ID` - Machine-to-machine client ID
- `KINDE_M2M_CLIENT_SECRET` - Machine-to-machine client secret

### Email (SendGrid)
- `SEND_API_KEY` - SendGrid API key

### Cloudinary
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name

### Sanity CMS
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID
- `SANITY_API_READ_TOKEN` - Sanity read token

### Other Services
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` - Facebook Pixel ID

## Scripts

- `scripts/setup-environments.js` - Generates environment files (with placeholders)
- `scripts/fix-env-local.js` - Creates/updates .env.local (with placeholders)

## Security Best Practices

1. **Never commit real credentials** to git
2. **Use different credentials** for development and production
3. **Rotate API keys** regularly
4. **Use environment-specific databases** to avoid data conflicts
5. **Keep backups** of your environment files locally (but not in git)

## Getting Your Credentials

### Kinde
1. Go to your Kinde admin panel
2. Create separate applications for development and production
3. Copy the client IDs and secrets

### SendGrid
1. Create a SendGrid account
2. Generate an API key with appropriate permissions

### Cloudinary
1. Create a Cloudinary account
2. Get your API credentials from the dashboard

### Database
1. Set up separate databases for development and production
2. Use connection pooling for production

## Troubleshooting

If you encounter issues:

1. **Check all required variables are set** in your `.env.local`
2. **Verify API keys are valid** and have correct permissions
3. **Ensure URLs match** your Kinde application settings
4. **Check database connectivity** with your connection string

## Need Help?

If you need the actual credentials for this project, contact the project maintainer securely (not through git/GitHub). 