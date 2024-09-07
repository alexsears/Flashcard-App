import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from 'firebase/app';
import ErrorBoundary from './ErrorBoundary'; // You'll need to create this component

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

if (process.env.NODE_ENV !== 'production') {
  console.log('Firebase Config:', firebaseConfig);
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
}

try {
  const app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

reportWebVitals();
