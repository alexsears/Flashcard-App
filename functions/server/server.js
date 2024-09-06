console.log('Starting server initialization...');
const express = require('express');
console.log('Express loaded');
const cors = require('cors');
console.log('CORS loaded');
const bodyParser = require('body-parser');
console.log('Body Parser loaded');
const admin = require('firebase-admin');
console.log('Firebase Admin loaded');
const fs = require('fs');
console.log('fs loaded');
const path = require('path');
console.log('path loaded');

console.log('Loading environment variables...');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('Environment variables loaded');

const app = express();
const port = process.env.PORT || 8080;

console.log('Checking required environment variables...');
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID', 
  'FIREBASE_PRIVATE_KEY_BASE64', 
  'FIREBASE_CLIENT_EMAIL',
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FIREBASE_MEASUREMENT_ID'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Error: Environment variable ${varName} is not set`);
    process.exit(1);
  }
});
console.log('All required environment variables are set');

console.log('Initializing Firebase Admin...');
try {
  const privateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
  
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, '\n')
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

console.log('Setting up middleware...');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../dist')));
console.log('Middleware set up complete');

console.log('Generating client-side Firebase config...');
const clientConfig = `
window.REACT_APP_FIREBASE_CONFIG = {
  apiKey: "${process.env.REACT_APP_FIREBASE_API_KEY}",
  authDomain: "${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com",
  projectId: "${process.env.FIREBASE_PROJECT_ID}",
  storageBucket: "${process.env.FIREBASE_PROJECT_ID}.appspot.com",
  messagingSenderId: "${process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${process.env.REACT_APP_FIREBASE_APP_ID}",
  measurementId: "${process.env.REACT_APP_FIREBASE_MEASUREMENT_ID}"
};
`;
fs.writeFileSync(path.join(__dirname, '../dist/firebaseConfig.js'), clientConfig);
console.log('Client-side Firebase config generated');

console.log('Loading routes...');
console.log('Current directory:', __dirname);
console.log('Files in current directory:', fs.readdirSync(__dirname));
try {
  
  const allRoutes = require('./server/routes/allRoutes');

  app.use('/api', allRoutes);
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
  console.error('Error stack:', error.stack);
  process.exit(1);
}
// ... rest of your code ...

console.log('Server initialization complete, starting server...');
const startServer = async () => {
  try {
    await admin.firestore().collection('Users').limit(1).get();
    console.log('Firestore connection verified');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();