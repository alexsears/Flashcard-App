#!/usr/bin/env node

/**
 * checkEnv.js
 * 
 * A script to verify the presence and validity of essential environment variables and secrets.
 * 
 * Usage:
 *   node checkEnv.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file if it exists
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
    process.exit(1);
  } else {
    console.log('✅ .env file loaded successfully.');
  }
} else {
  console.warn('⚠️  No .env file found. Proceeding with existing environment variables.');
}

// List of required environment variables and secrets
const requiredEnvVars = [
  { name: 'GOOGLE_CLOUD_PROJECT', type: 'string' },
  { name: 'NODE_ENV', type: 'string' },
  { name: 'REACT_APP_SERVER_URL', type: 'url' },
  { name: 'CORS_ORIGIN', type: 'string' },
  { name: 'FIREBASE_CLIENT_EMAIL', type: 'email' },
  { name: 'FIREBASE_CONFIG', type: 'json' },
  { name: 'FIREBASE_PRIVATE_KEY_BASE64', type: 'base64' },
  { name: 'FIREBASE_PROJECT_ID', type: 'string' },
  { name: 'LOG_LEVEL', type: 'string' },
  { name: 'REACT_APP_API_URL', type: 'url' },
  { name: 'REACT_APP_FIREBASE_API_KEY', type: 'string' },
  { name: 'REACT_APP_FIREBASE_APP_ID', type: 'string' },
  { name: 'REACT_APP_FIREBASE_MEASUREMENT_ID', type: 'string' },
  { name: 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID', type: 'string' },
  { name: 'SERVER_URL', type: 'url' },
];

// Helper functions for validation
const validators = {
  string: (value) => typeof value === 'string' && value.trim() !== '',
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch (err) {
      return false;
    }
  },
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  base64: (value) => {
    try {
      Buffer.from(value, 'base64').toString('utf8');
      return true;
    } catch (err) {
      return false;
    }
  },
  json: (value) => {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf8');
      JSON.parse(decoded);
      return true;
    } catch (err) {
      return false;
    }
  },
};

// Function to check each environment variable
function checkEnv() {
  console.log('\n🛡️  Checking Environment Variables and Secrets...\n');

  let allPassed = true;

  requiredEnvVars.forEach((envVar) => {
    const { name, type } = envVar;
    const value = process.env[name];

    if (!value) {
      console.error(`❌ Missing Environment Variable: ${name}`);
      allPassed = false;
      return;
    }

    const isValid = validators[type](value);

    if (!isValid) {
      console.error(`❌ Invalid Format for ${name}. Expected type: ${type}`);
      allPassed = false;
      return;
    }

    // Additional detailed checks for specific types
    if (type === 'base64') {
      try {
        const decoded = Buffer.from(value, 'base64').toString('utf8');
        console.log(`✅ ${name} is set and valid base64.`);
      } catch (err) {
        console.error(`❌ ${name} is not valid base64.`);
        allPassed = false;
      }
    } else if (type === 'json') {
      try {
        const decoded = Buffer.from(value, 'base64').toString('utf8');
        JSON.parse(decoded);
        console.log(`✅ ${name} is set and valid JSON.`);
      } catch (err) {
        console.error(`❌ ${name} is not valid JSON.`);
        allPassed = false;
      }
    } else {
      console.log(`✅ ${name} is set and valid.`);
    }
  });

  if (allPassed) {
    console.log('\n🎉 All required environment variables and secrets are properly set.\n');
    process.exit(0);
  } else {
    console.error('\n⚠️  Some environment variables or secrets are missing or invalid.');
    console.error('Please review the errors above and rectify them before proceeding.\n');
    process.exit(1);
  }
}

// Execute the check
try {
  checkEnv();
} catch (error) {
  console.error('❌ An unexpected error occurred:', error);
  process.exit(1);
}
