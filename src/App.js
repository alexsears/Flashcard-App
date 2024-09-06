import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles.css';
import FlashcardList from './FlashcardList';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import FirebaseAuth from './FirebaseAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import Flashcard from './Flashcard';
import TopBar from './TopBar';
import ManagerConsole from './ManagerConsole';  // Import ManagerConsole here

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const refreshAuthToken = async (user) => {
  if (user) {
    try {
      const token = await user.getIdToken(true);
      console.log("Auth token refreshed");
      return token;
    } catch (error) {
      console.error("Error refreshing auth token:", error);
    }
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [score, setScore] = useState(0);
  const [languageMode, setLanguageMode] = useState('english'); // New state for language mode

  const updateFlashcards = useCallback(async (uid, token) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/flashcards?firebaseUid=${uid}&limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const newCards = data.limitedCards || [];
      setFlashcards((prevCards) => {
        // Avoid adding duplicate flashcards by checking IDs
        const uniqueCards = newCards.filter(card => !prevCards.some(prevCard => prevCard.id === card.id));
        return [...prevCards, ...uniqueCards];
      });
      setScore(data.score || 0);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    }
  }, []);
  
  const handleLanguageChange = (mode) => {
    setLanguageMode(mode);
  };

  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
  
      if (user) {
        console.log('User signed in:', user);  // Add this log to ensure user is set
        try {
          const token = await refreshAuthToken(user);
          if (token) {
            const response = await fetch(`${SERVER_URL}/api/user/${user.uid}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const userData = await response.json();
              setCurrentUser({
                ...user,
                role: userData.role
              });
              setScore(userData.score || 0);
            } else {
              console.error('Failed to fetch user data');
            }
            await updateFlashcards(user.uid, token);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setCurrentUser(null);
      }
    });
  
    return () => unsubscribe();
  }, [updateFlashcards]);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <FirebaseAuth />;
  }

  return (
    <Router>
      <div className="App">
        <TopBar
          currentUser={currentUser}
          score={score}
          onLogout={() => signOut(getAuth())}
          onLanguageChange={handleLanguageChange} // Pass language change handler
        />
        <main>
          {currentUser ? (
            <Routes>
              // In App.js
              <Route path="/" element={
                <FlashcardList
                  key={flashcards.length}
                  firebaseUid={currentUser.uid}
                  initialFlashcards={flashcards}
                  updateFlashcards={() => updateFlashcards(currentUser.uid)}
                  score={score}
                  setScore={setScore}
                  languageMode={languageMode}
                  currentUser={currentUser} // Add this line
                />
              } />
              <Route path="/manager-console" element={<ManagerConsole />} />
            </Routes>
          ) : (
            <FirebaseAuth />
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
