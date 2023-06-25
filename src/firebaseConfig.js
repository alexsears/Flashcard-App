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
