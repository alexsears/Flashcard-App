const fs = require('fs');
const path = require('path');

const envFilePath = path.resolve(__dirname, '.env.production');
const outputFilePath = path.resolve(__dirname, '.env');
const envFileContent = fs.readFileSync(envFilePath, 'utf-8');

const requiredVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FIREBASE_MEASUREMENT_ID',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_BASE64',
  'FIREBASE_CLIENT_EMAIL'
];

const envVars = envFileContent.split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim(); // Handle values with '=' in them
    acc[key.trim()] = value;
    return acc;
  }, {});

// Check if all required variables are present
requiredVars.forEach(varName => {
  if (!envVars[varName]) {
    console.warn(`Warning: ${varName} is not set in .env.production`);
  }
});

const outputContent = Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(outputFilePath, outputContent, 'utf-8');
console.log('Environment variables have been written to', outputFilePath);