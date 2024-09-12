import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from 'firebase/app';
import ErrorBoundary from './ErrorBoundary';
import { logEnvironmentInfo, initializeFirebase } from './utils/firebaseUtils';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Log environment information (only in development)
if (process.env.NODE_ENV === 'development') {
  logEnvironmentInfo();
}

// Initialize Firebase
const firebaseApp = initializeFirebase();

// Render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App firebaseApp={firebaseApp} />
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();