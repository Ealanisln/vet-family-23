#!/usr/bin/env node

/**
 * Kinde Configuration Update Script
 * 
 * This script helps update Kinde credentials in environment files
 * Usage: node scripts/update-kinde-config.js [environment] [clientId] [clientSecret] [m2mClientId] [m2mClientSecret]
 */

const fs = require('fs');
const path = require('path');

function updateKindeConfig(environment, credentials) {
  const envFile = `.env.${environment}`;
  const envPath = path.join(process.cwd(), envFile);
  
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file ${envFile} not found!`);
    console.log('Run: node scripts/setup-environments.js first');
    return false;
  }
  
  let content = fs.readFileSync(envPath, 'utf8');
  
  // Update Kinde credentials
  content = content.replace(/KINDE_CLIENT_ID="[^"]*"/, `KINDE_CLIENT_ID="${credentials.clientId}"`);
  content = content.replace(/KINDE_CLIENT_SECRET="[^"]*"/, `KINDE_CLIENT_SECRET="${credentials.clientSecret}"`);
  content = content.replace(/KINDE_M2M_CLIENT_ID="[^"]*"/, `KINDE_M2M_CLIENT_ID="${credentials.m2mClientId}"`);
  content = content.replace(/KINDE_M2M_CLIENT_SECRET="[^"]*"/, `KINDE_M2M_CLIENT_SECRET="${credentials.m2mClientSecret}"`);
  
  fs.writeFileSync(envPath, content);
  console.log(`✅ Updated Kinde configuration in ${envFile}`);
  return true;
}

function showKindeSetupInstructions() {
  console.log('\n🔧 Kinde Setup Instructions:');
  console.log('\n📋 For Development Environment:');
  console.log('1. Go to https://vetfamily.kinde.com/admin');
  console.log('2. Click "Add application"');
  console.log('3. Choose "Regular web app"');
  console.log('4. Set application name: "VetForFamily Development"');
  console.log('5. Set the following URLs:');
  console.log('   - Allowed callback URLs: https://development.vetforfamily.com/api/auth/kinde_callback');
  console.log('   - Allowed logout redirect URLs: https://development.vetforfamily.com');
  console.log('   - Allowed origins: https://development.vetforfamily.com');
  console.log('6. Save and copy the credentials');
  console.log('7. Also create a Machine to Machine application for API access');
  
  console.log('\n📋 For Production Environment:');
  console.log('1. Update existing production app or create new one');
  console.log('2. Set the following URLs:');
  console.log('   - Allowed callback URLs: https://vetforfamily.com/api/auth/kinde_callback');
  console.log('   - Allowed logout redirect URLs: https://vetforfamily.com');
  console.log('   - Allowed origins: https://vetforfamily.com');
  
  console.log('\n🔑 Update credentials using this script:');
  console.log('node scripts/update-kinde-config.js development [clientId] [clientSecret] [m2mClientId] [m2mClientSecret]');
  console.log('node scripts/update-kinde-config.js production [clientId] [clientSecret] [m2mClientId] [m2mClientSecret]');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showKindeSetupInstructions();
    return;
  }
  
  if (args.length !== 5) {
    console.error('❌ Invalid arguments!');
    console.log('Usage: node scripts/update-kinde-config.js [environment] [clientId] [clientSecret] [m2mClientId] [m2mClientSecret]');
    console.log('Example: node scripts/update-kinde-config.js development abc123 def456 ghi789 jkl012');
    return;
  }
  
  const [environment, clientId, clientSecret, m2mClientId, m2mClientSecret] = args;
  
  if (!['development', 'production'].includes(environment)) {
    console.error('❌ Environment must be either "development" or "production"');
    return;
  }
  
  const credentials = {
    clientId,
    clientSecret,
    m2mClientId,
    m2mClientSecret
  };
  
  console.log(`🔄 Updating Kinde configuration for ${environment} environment...`);
  
  if (updateKindeConfig(environment, credentials)) {
    console.log('✅ Kinde configuration updated successfully!');
    console.log(`\n🚀 You can now run:`);
    console.log(`- Development: pnpm run ${environment === 'development' ? 'dev:staging' : 'start:production'}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { updateKindeConfig }; 