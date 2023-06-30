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
