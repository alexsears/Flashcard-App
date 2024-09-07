
// At the beginning of the file
console.log('Node environment:', process.env.NODE_ENV);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY_BASE64 is set:', !!process.env.FIREBASE_PRIVATE_KEY_BASE64);
console.log('FIREBASE_CONFIG is set:', !!process.env.FIREBASE_CONFIG);
console.log('decodedPrivateKey:', decodedPrivateKey);

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
// Decode the base64 private key
let decodedPrivateKey;
try {
  decodedPrivateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf8');
} catch (error) {
  console.error('Error decoding FIREBASE_PRIVATE_KEY_BASE64:', error);
  process.exit(1);
}


const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY_BASE64', 'FIREBASE_CONFIG'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: decodedPrivateKey.replace(/\\n/g, '\n')
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}
// Express app setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Parse FIREBASE_CONFIG
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
} catch (error) {
  console.error('Error parsing FIREBASE_CONFIG:', error);
  process.exit(1);
}

const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  console.error(`Dist directory not found: ${distDir}`);
  process.exit(1);
}

const clientConfig = `
window.REACT_APP_FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig)};
`;
fs.writeFileSync(path.join(distDir, 'firebaseConfig.js'), clientConfig);

app.get('/firebaseConfig.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(clientConfig);
});

// Import routes
const allRoutes = require('./server/routes/allRoutes');
app.use('/api', allRoutes);

// Health check route
app.get('/health', (req, res) => {
  admin.app().options.credential.getAccessToken()
    .then(() => {
      res.status(200).json({ status: 'OK', firebase: 'Connected' });
    })
    .catch((error) => {
      console.error('Firebase connection error:', error);
      res.status(500).json({ status: 'Error', message: 'Firebase connection failed' });
    });
});

// Serve static files
app.use(express.static(distDir));

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

if (process.env.NODE_ENV === 'production') {
  // Export as a Cloud Function
  exports.api = functions.https.onRequest(app);
} else {
  // Local server for development
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Always export the app for Cloud Run
module.exports = app;