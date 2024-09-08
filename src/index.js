import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from 'firebase/app';
import ErrorBoundary from './ErrorBoundary'; // Ensure this component exists
require('dotenv').config();

// Initialize decodedPrivateKey safely
let decodedPrivateKey = null;
if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
  decodedPrivateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
}

console.log('Node environment:', process.env.NODE_ENV);
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY_BASE64 is set:', !!process.env.FIREBASE_PRIVATE_KEY_BASE64);
console.log('FIREBASE_CONFIG is set:', !!process.env.FIREBASE_CONFIG);
console.log('decodedPrivateKey:', decodedPrivateKey);

if (!decodedPrivateKey) {
  console.error('FIREBASE_PRIVATE_KEY_BASE64 is not set or is invalid.');
}

// Continue with your Firebase initialization or other logic here

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Log Firebase config in development mode
if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase Config:', firebaseConfig);
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
}

// Initialize Firebase
try {
  const firebaseApp = initializeApp(firebaseConfig); // Renamed to firebaseApp to avoid confusion
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();
