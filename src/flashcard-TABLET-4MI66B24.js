import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

function Flashcard({ flashcard }) {
  const [flipped, setFlipped] = useState(false);

  const handleTap = () => {
    setFlipped(!flipped);
  };

  const handleSwipeLeft = () => {
    console.log('Incorrect');
    // Handle the action for marking the flashcard as incorrect
  };

  const handleSwipeRight = () => {
    console.log('Correct');
    // Handle the action for marking the flashcard as correct
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    preventDefaultTouchmoveEvent: true,
  });

  return (
    <div {...handlers} className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={handleTap}>
      <div className="flashcard-content">
        <div className="front">{flashcard.question}</div>
        <div className="back">{flashcard.answer}</div>
      </div>
    </div>
  );
}

export default Flashcard;
