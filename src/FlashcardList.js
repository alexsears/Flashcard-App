<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from 'react';
import Flashcard from './Flashcard';

function FlashcardList({ userId }) {  
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:3000/flashcards?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
          setFlashcards(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching flashcards:', error);
          setLoading(false);
        });
    }
  }, [userId]);

  const handleCorrect = (responseTime) => {
    const reviewResult = responseTime <= 5000 ? 'easy' : 'hard';
    submitReview(reviewResult);
    proceedToNextFlashcard();
  };

  const handleIncorrect = (responseTime) => {
    const reviewResult = 'hard';
    submitReview(reviewResult);
    proceedToNextFlashcard();
  };

  const submitReview = (reviewResult) => {
    fetch('http://localhost:3000/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        cardId: flashcards[currentFlashcardIndex]._id,
        reviewResult,
      }),
    })
    .then(response => response.json())
    .then(data => console.log('Review submitted:', data))
    .catch(error => console.error('Error submitting review:', error));
  };

  const proceedToNextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {currentFlashcardIndex < flashcards.length ? (
        <Flashcard
          flashcard={flashcards[currentFlashcardIndex]}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
        />
      ) : (
        <h2>You've gone through all the flashcards. Well done!</h2>
      )}
    </div>
  );
}

export default FlashcardList;
>>>>>>> 5c6fa5765b8595fd5a1ddf0afbc5a26c9d8a1080
