import React, { useEffect, useState } from 'react';
import Flashcard from './Flashcard';

function FlashcardList() {
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/flashcards')
      .then(response => response.json())
      .then(data => setFlashcards(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className="flashcard-list">
      {flashcards.map(flashcard => (
        <Flashcard key={flashcard._id} flashcard={flashcard} />
      ))}
    </div>
  );
}

export default FlashcardList;
