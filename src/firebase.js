import firebase from 'firebase/app';
import 'firebase/auth';     // for authentication
import 'firebase/firestore'; // for cloud firestore
// Add additional services that you want to use

const config = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  // Other config properties
};

firebase.initializeApp(config);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
// export other firebase services

export default firebase;
