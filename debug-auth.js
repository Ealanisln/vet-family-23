#!/usr/bin/env node

// Script para debuggear problemas de autenticación
// Uso: node debug-auth.js

const https = require('https');

const endpoints = [
  '/api/admin-check',
  '/api/auth-status',
  '/api/auth-debug'
];

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

console.log('🔍 Debugging Auth System...');
console.log(`Base URL: ${baseUrl}`);
console.log('=' .repeat(60));

async function testEndpoint(endpoint) {
  try {
    console.log(`\n📡 Testing ${endpoint}...`);
    
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (endpoint === '/api/admin-check') {
      if (data.isAdmin) {
        console.log('✅ User is ADMIN');
      } else {
        console.log('❌ User is NOT admin');
      }
      
      if (data.isAuthenticated) {
        console.log('✅ User is authenticated');
      } else {
        console.log('❌ User is NOT authenticated');
      }
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Debug complete!');
  console.log('\n💡 Tips:');
  console.log('- Check server logs for detailed error messages');
  console.log('- Verify your Kinde configuration in the dashboard');
  console.log('- Make sure admin roles are properly assigned');
}

main().catch(console.error);
