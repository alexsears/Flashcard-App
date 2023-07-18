import React, { useEffect, useState } from 'react';
import './App.css';
import FlashcardList from './FlashcardList';
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Adjusted import
import LogoutButton from './LogoutButton';
import FirebaseAuth from './FirebaseAuth';

function App() {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // returning the unsubscribe function will ensure that
    // we unsubscribe from this listener if the component unmounts.
    return unsubscribe; 
  }, []);

  // display a loading message while waiting for the auth state to change
  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="App">
      {currentUser ? (
        <div>
          <LogoutButton />
          <FlashcardList userId={currentUser.uid} /> {/* Pass userId to FlashcardList */}
        </div>
      ) : (
        <FirebaseAuth />
      )}
    </div>
  );
}

export default App;
