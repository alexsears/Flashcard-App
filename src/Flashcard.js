import React, { useState, useEffect } from 'react';
import './Flashcard.css';

function Flashcard({ flashcard, onCorrect, onIncorrect }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setStartTime(Date.now()); // start timer when card is rendered
  }, [flashcard]);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCardClick = (e) => {
    const card = e.target.getBoundingClientRect();
    const clickedPosition = (e.clientX - card.left) / card.width;

    const responseTime = Date.now() - startTime; // calculate response time

    if (clickedPosition < 0.1) {
      onIncorrect(responseTime);
    } else if (clickedPosition > 0.9) {
      onCorrect(responseTime);
    } else {
      flipCard();
    }
  };

  if (!flashcard) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`flashcard-container ${isFlipped ? 'is-flipped' : ''}`} onClick={handleCardClick}>
      <div className="flashcard-flipper">
        <div className="flashcard-question">{flashcard.front}</div>
        <div className="flashcard-answer">{flashcard.back}</div>
      </div>
    </div>
  );
}

export default Flashcard;
