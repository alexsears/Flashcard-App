import React, { useState, useEffect, useCallback } from 'react';
import Flashcard from './Flashcard';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function FlashcardList({ firebaseUid, initialFlashcards, updateFlashcards, score, setScore, languageMode, currentUser }) {  
  const [flashcards, setFlashcards] = useState(initialFlashcards || []);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialFlashcards && initialFlashcards.length > 0) {
      setFlashcards(initialFlashcards);
      setCurrentFlashcardIndex(0);
    } else {
      fetchMoreFlashcards();
    }
  }, [initialFlashcards]);

  const fetchMoreFlashcards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/flashcards?firebaseUid=${firebaseUid}&limit=3`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const newCards = data.limitedCards || [];
      setFlashcards(newCards);
      setCurrentFlashcardIndex(0);
    } catch (error) {
      console.error('Error fetching more flashcards:', error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  const handleAnswer = useCallback((action) => {
    // Move to the next card
    const nextIndex = currentFlashcardIndex + 1;
    if (nextIndex < flashcards.length) {
      setCurrentFlashcardIndex(nextIndex);
    } else {
      // If we've reached the end of the current set, fetch more cards
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

  return (
    <Flashcard
      key={currentFlashcard.id}
      flashcard={currentFlashcard}
      onCorrect={() => handleAnswer('correct')}
      onIncorrect={() => handleAnswer('incorrect')}
      languageMode={languageMode}
      currentUser={currentUser}
      setScore={setScore}
    />
  );
}

export default FlashcardList;