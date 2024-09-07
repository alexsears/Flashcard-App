<<<<<<< HEAD
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase Config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
=======
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from "firebase/auth";

require('dotenv').config();
const REACT_APP_firebaseApi = encodeURIComponent(process.env.REACT_APP_firebaseApi);
const REACT_APP_firebaseMessagingSenderId = encodeURIComponent(process.env.REACT_APP_firebaseMessagingSenderId);
const REACT_APP_firebaseAppId = encodeURIComponent(process.env.REACT_APP_firebaseAppId);
const REACT_APP_firebaseMeasurementId = encodeURIComponent(process.env.REACT_APP_firebaseMeasurementId);
const firebaseConfig = {
  apiKey: REACT_APP_firebaseApi,
  authDomain: "pootcuppeelek.firebaseapp.com",
  databaseURL: "https://pootcuppeelek-default-rtdb.firebaseio.com",
  projectId: "pootcuppeelek",
  storageBucket: "pootcuppeelek.appspot.com",
  messagingSenderId: REACT_APP_firebaseMessagingSenderId,
  appId: REACT_APP_firebaseAppId,
  measurementId: REACT_APP_firebaseMeasurementId
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, analytics, auth, provider };
>>>>>>> 5c6fa5765b8595fd5a1ddf0afbc5a26c9d8a1080
