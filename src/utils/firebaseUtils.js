import { initializeApp } from 'firebase/app';

export const logEnvironmentInfo = () => {
  console.log('Node environment:', process.env.NODE_ENV);
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
  console.log('FIREBASE_PRIVATE_KEY_BASE64 is set:', !!process.env.FIREBASE_PRIVATE_KEY_BASE64);
  console.log('FIREBASE_CONFIG is set:', !!process.env.FIREBASE_CONFIG);

  // Decode private key if needed
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    const decodedPrivateKey = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
    console.log('decodedPrivateKey:', decodedPrivateKey);
  } else {
    console.error('FIREBASE_PRIVATE_KEY_BASE64 is not set or is invalid.');
  }
};

export const initializeFirebase = () => {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Firebase Config:', firebaseConfig);
  }

  try {
    const app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    return app;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};