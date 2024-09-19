import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const FlashcardList = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser ? 'User logged in' : 'User not logged in');
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          console.log('Got user token');
          const response = await fetch('/api/flashcards', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('Flashcards response:', response.status);
          if (!response.ok) {
            throw new Error('Failed to fetch flashcards');
          }
          const data = await response.json();
          console.log('Fetched flashcards:', data);
          setFlashcards(data);
        } catch (error) {
          console.error('Error fetching flashcards:', error);
          setError(error.message);
        }
      }
    };

    if (user) {
      fetchFlashcards();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to view flashcards.</div>;
  if (error) return <div>Error: {error}</div>;
  if (flashcards.length === 0) return <div>No flashcards available.</div>;

  return (
    <div>
      <h2>Flashcards</h2>
      {flashcards.map((card, index) => (
        <div key={card.id || index}>
          <h3>{card.front}</h3>
          <p>{card.back}</p>
        </div>
      ))}
    </div>
  );
};

export default FlashcardList;