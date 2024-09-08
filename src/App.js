import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles.css';
import FlashcardList from './FlashcardList';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import FirebaseAuth from './FirebaseAuth';
import 'bootstrap/dist/css/bootstrap.min.css';
import TopBar from './TopBar';
import ManagerConsole from './ManagerConsole';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

const refreshAuthToken = async (user) => {
  if (user) {
    try {
      const token = await user.getIdToken(true);
      console.log(`${new Date().toISOString()} - Auth token refreshed`);
      return token;
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error refreshing auth token:`, error);
    }
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [score, setScore] = useState(0);
  const [languageMode, setLanguageMode] = useState('english');

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
      console.log(`${new Date().toISOString()} - Flashcards API response:`, data);
      
      if (data.cards && Array.isArray(data.cards)) {
        setFlashcards((prevCards) => {
          const uniqueCards = data.cards.filter(card => 
            !prevCards.some(prevCard => 
              (prevCard.id || prevCard.cardId) === (card.id || card.cardId)
            )
          );
          return [...prevCards, ...uniqueCards.map(card => ({
            ...card,
            id: card.id || card.cardId
          }))];
        });
      } else {
        console.error('Unexpected response format: cards is not an array', data);
      }
      
      if (data.score !== undefined) {
        console.log(`${new Date().toISOString()} - Updating score from flashcards API:`, data.score);
        setScore(data.score);
      }
  
      return data.totalCards || 0;
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      return 0;
    }
  }, [setScore, setFlashcards]);
  const handleLanguageChange = useCallback((mode) => {
    setLanguageMode(mode);
  }, []);

  useEffect(() => {
    const auth = getAuth();
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
  
      if (user) {
        console.log(`${new Date().toISOString()} - User signed in:`, user);
        try {
          const token = await refreshAuthToken(user);
          if (token) {
            console.log(`${new Date().toISOString()} - Token refreshed, fetching user data`);
            const response = await fetch(`${SERVER_URL}/api/user/${user.uid}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const userData = await response.json();
              console.log(`${new Date().toISOString()} - Received user data:`, userData);
              setCurrentUser({
                ...user,
                role: userData.role
              });
              console.log(`${new Date().toISOString()} - Setting initial score to:`, userData.score);
              setScore(userData.score || 0);
            } else {
              console.error(`${new Date().toISOString()} - Failed to fetch user data`);
            }
            await updateFlashcards(user.uid, token);
          }
        } catch (error) {
          console.error(`${new Date().toISOString()} - Error fetching user data:`, error);
        }
      } else {
        setCurrentUser(null);
      }
    });
  
    return () => unsubscribe();
  }, [updateFlashcards]);

  const updateScore = useCallback((newScore) => {
    console.log(`${new Date().toISOString()} - Updating global score from ${score} to ${newScore}`);
    setScore(newScore);
  }, [score]);

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
          onLanguageChange={handleLanguageChange}
        />
        <main>
          {currentUser && (
            <Routes>
              <Route path="/" element={
                <FlashcardList
                  key={flashcards.length}
                  firebaseUid={currentUser.uid}
                  initialFlashcards={flashcards}
                  updateFlashcards={() => updateFlashcards(currentUser.uid)}
                  score={score}
                  setScore={updateScore}
                  languageMode={languageMode}
                  currentUser={currentUser}
                />
              } />
              <Route path="/manager-console" element={<ManagerConsole />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;