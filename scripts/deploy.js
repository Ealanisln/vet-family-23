#!/usr/bin/env node

/**
 * Deployment Script for VetForFamily
 * 
 * This script handles deployment to different environments:
 * - Development: development.vetforfamily.com
 * - Production: vetforfamily.com
 * 
 * Usage: node scripts/deploy.js [environment]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment configurations
const environments = {
  development: {
    name: 'development',
    domain: 'development.vetforfamily.com',
    envFile: '.env.development',
    branch: 'development',
    description: 'Development/Staging environment'
  },
  production: {
    name: 'production',
    domain: 'vetforfamily.com',
    envFile: '.env.production',
    branch: 'main',
    description: 'Production environment'
  }
};

function checkEnvironmentFile(envFile) {
  const envPath = path.join(process.cwd(), envFile);
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file ${envFile} not found!`);
    console.log('Run: node scripts/setup-environments.js first');
    return false;
  }
  
  // Check if Kinde credentials are configured
  const content = fs.readFileSync(envPath, 'utf8');
  if (content.includes('YOUR_DEV_CLIENT_ID_HERE') || content.includes('YOUR_PROD_CLIENT_ID_HERE')) {
    console.error(`❌ Kinde credentials not configured in ${envFile}!`);
    console.log('Run: node scripts/update-kinde-config.js to update credentials');
    return false;
  }
  
  return true;
}

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function deployToEnvironment(env) {
  const config = environments[env];
  
  console.log(`\n🚀 Deploying to ${config.description}`);
  console.log(`📍 Domain: ${config.domain}`);
  console.log(`📁 Environment file: ${config.envFile}`);
  console.log(`🌿 Branch: ${config.branch}\n`);
  
  // Check environment file
  if (!checkEnvironmentFile(config.envFile)) {
    return false;
  }
  
  // Pre-deployment checks
  console.log('🔍 Running pre-deployment checks...');
  
  // Check if we're on the correct branch
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (currentBranch !== config.branch) {
      console.log(`⚠️  Current branch: ${currentBranch}, expected: ${config.branch}`);
      console.log(`Switching to ${config.branch} branch...`);
      runCommand(`git checkout ${config.branch}`, `Switch to ${config.branch} branch`);
    }
  } catch (error) {
    console.log('⚠️  Could not determine current branch, continuing...');
  }
  
  // Pull latest changes
  runCommand('git pull origin HEAD', 'Pull latest changes');
  
  // Install dependencies
  runCommand('pnpm install', 'Install dependencies');
  
  // Run linting
  runCommand('pnpm run lint', 'Run ESLint checks');
  
  // Generate Prisma client
  runCommand(`dotenv -e ${config.envFile} pnpm prisma generate`, 'Generate Prisma client');
  
  // Run database migrations (if needed)
  try {
    runCommand(`dotenv -e ${config.envFile} pnpm prisma migrate deploy`, 'Deploy database migrations');
  } catch (error) {
    console.log('⚠️  Database migration failed or not needed, continuing...');
  }
  
  // Build the application
  runCommand(`dotenv -e ${config.envFile} pnpm run build`, 'Build application');
  
  // Deploy based on environment
  if (env === 'production') {
    console.log('\n🚀 Deploying to production...');
    // Add your production deployment commands here
    // For example, if using Vercel:
    // runCommand('vercel --prod', 'Deploy to Vercel production');
    
    // Or if using PM2:
    runCommand(`dotenv -e ${config.envFile} pm2 restart vetforfamily-prod || dotenv -e ${config.envFile} pm2 start "pnpm start" --name vetforfamily-prod`, 'Deploy with PM2');
    
  } else if (env === 'development') {
    console.log('\n🚀 Deploying to development...');
    // Add your development deployment commands here
    // For example:
    runCommand(`dotenv -e ${config.envFile} pm2 restart vetforfamily-dev || dotenv -e ${config.envFile} pm2 start "pnpm start" --name vetforfamily-dev`, 'Deploy with PM2');
  }
  
  console.log(`\n✅ Deployment to ${config.description} completed successfully!`);
  console.log(`🌐 Visit: https://${config.domain}`);
  
  return true;
}

function showUsage() {
  console.log('🚀 VetForFamily Deployment Script\n');
  console.log('Usage: node scripts/deploy.js [environment]\n');
  console.log('Available environments:');
  Object.entries(environments).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(12)} - ${config.description} (${config.domain})`);
  });
  console.log('\nExamples:');
  console.log('  node scripts/deploy.js development');
  console.log('  node scripts/deploy.js production');
  console.log('\n📋 Prerequisites:');
  console.log('1. Run: node scripts/setup-environments.js');
  console.log('2. Configure Kinde credentials');
  console.log('3. Ensure correct git branch');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showUsage();
    return;
  }
  
  const environment = args[0];
  
  if (!environments[environment]) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.log('\nAvailable environments:', Object.keys(environments).join(', '));
    return;
  }
  
  // Confirmation prompt for production
  if (environment === 'production') {
    console.log('⚠️  You are about to deploy to PRODUCTION!');
    console.log('This will affect the live website at vetforfamily.com');
    console.log('\nPress Ctrl+C to cancel, or press Enter to continue...');
    
    // Simple confirmation (in a real script, you might want to use a proper prompt library)
    try {
      execSync('read -p ""', { stdio: 'inherit' });
    } catch (error) {
      console.log('Deployment cancelled.');
      return;
    }
  }
  
  deployToEnvironment(environment);
}

if (require.main === module) {
  main();
}

module.exports = { deployToEnvironment, environments }; 