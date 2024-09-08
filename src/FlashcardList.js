import React, { useState, useEffect, useCallback } from 'react';
import Flashcard from './Flashcard';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function FlashcardList({ firebaseUid, initialFlashcards, updateFlashcards, score, setScore, languageMode, currentUser, token }) {
  const [flashcards, setFlashcards] = useState(initialFlashcards || []);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Initial flashcards:', initialFlashcards);
    if (initialFlashcards && initialFlashcards.length > 0) {
      console.log('Setting flashcards from initialFlashcards');
      setFlashcards(initialFlashcards);
      setCurrentFlashcardIndex(0);
    } else {
      console.log('Fetching more flashcards');
      fetchMoreFlashcards();
    }
  }, [initialFlashcards]);

  useEffect(() => {
    console.log('Current flashcards:', flashcards);
  }, [flashcards]);

  const fetchMoreFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching more flashcards...');
      const response = await fetch(`${API_URL}/api/flashcards?firebaseUid=${firebaseUid}&limit=3`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched flashcards:', data);
      const newCards = data.limitedCards || [];
      if (newCards.length === 0) {
        console.warn('No flashcards returned from the server');
      }
      setFlashcards(newCards.map(card => ({
        ...card,
        id: card.id || card.cardId
      })));
      setCurrentFlashcardIndex(0);
    } catch (error) {
      console.error('Error fetching more flashcards:', error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUid, token]);

  const handleAnswer = useCallback((action) => {
    const nextIndex = currentFlashcardIndex + 1;
    if (nextIndex < flashcards.length) {
      setCurrentFlashcardIndex(nextIndex);
    } else {
      fetchMoreFlashcards();
    }
  }, [currentFlashcardIndex, flashcards.length, fetchMoreFlashcards]);

  if (loading) {
    return <div>Loading flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return <div>Great job! You've completed all available cards for now.</div>;
  }

  const currentFlashcard = flashcards[currentFlashcardIndex];

  if (!currentFlashcard || (!currentFlashcard.id && !currentFlashcard.cardId)) {
    console.error('Current flashcard or its ID is missing', currentFlashcard);
    return <div>Error: Invalid flashcard data</div>;
  }

  return (
    <Flashcard
      key={currentFlashcard.id || currentFlashcard.cardId}
      flashcard={{
        ...currentFlashcard,
        id: currentFlashcard.id || currentFlashcard.cardId
      }}
      onCorrect={() => handleAnswer('correct')}
      onIncorrect={() => handleAnswer('incorrect')}
      languageMode={languageMode}
      currentUser={currentUser}
      setScore={setScore}
      token={token}
    />
  );
}

export default FlashcardList;