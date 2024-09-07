<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function Flashcard({ flashcard, onCorrect, onIncorrect, languageMode, currentUser, setScore }) {
  const frontContent = languageMode === 'english' ? flashcard.front : flashcard.back;
  const backContent = languageMode === 'english' ? flashcard.back : flashcard.front;
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    setCardStatus('');
    setIsFlipped(false);
  }, [flashcard]);

  const submitReview = useCallback(async (performanceRating) => {
    if (!currentUser || !currentUser.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: currentUser.uid,
          flashcardId: flashcard.id,
          performanceRating
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Review submitted and score updated:', result);
      
      if (performanceRating === 'correct') {
        setScore(prevScore => prevScore + 1);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  }, [currentUser, flashcard.id, setScore]);

  const debouncedOnCorrect = useCallback(
    debounce(() => {
      setCardStatus('correct');
      submitReview('correct');
      setTimeout(() => {
        onCorrect();
        setCardStatus('');
      }, 300);
    }, 500, { leading: true, trailing: false }),
    [onCorrect, submitReview]
  );

  const debouncedOnIncorrect = useCallback(
    debounce(() => {
      setCardStatus('incorrect');
      submitReview('incorrect');
      setTimeout(() => {
        onIncorrect();
        setCardStatus('');
      }, 300);
    }, 500, { leading: true, trailing: false }),
    [onIncorrect, submitReview]
  );

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft') {
        debouncedOnIncorrect();
      } else if (e.key === 'ArrowRight') {
        debouncedOnCorrect();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        flipCard();
      }
    },
    [debouncedOnCorrect, debouncedOnIncorrect, flipCard]
  );

  const handleCardClick = useCallback(
    (e) => {
      const card = e.currentTarget.getBoundingClientRect();
      const clickedPosition = (e.clientX - card.left) / card.width;

      if (clickedPosition < 0.1) {
        debouncedOnIncorrect();
      } else if (clickedPosition > 0.9) {
        debouncedOnCorrect();
      } else {
        flipCard();
      }
    },
    [debouncedOnCorrect, debouncedOnIncorrect, flipCard]
  );

  const handlePlay = useCallback(
    async (text, languageCode) => {
      try {
        setIsPlaying(true);
        const response = await fetch(`${API_URL}/api/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, languageCode }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = playbackSpeed;
        await audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      } finally {
        setIsPlaying(false);
      }
    },
    [playbackSpeed]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!flashcard) {
    return <div>No flashcard available</div>;
  }

  return (
    <div className="flashcard-wrapper">
      <div
        className={`flashcard-container ${isFlipped ? 'is-flipped' : ''} ${cardStatus}`}
        onClick={handleCardClick}
        tabIndex="0"
      >
        <div className="flashcard-flipper">
          <div className="flashcard-face flashcard-question">
            <div className="flashcard-content">{frontContent}</div>
            <button
              className={`play-button ${isPlaying ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlay(frontContent, languageMode === 'english' ? 'en-US' : 'th-TH');
              }}
              disabled={isPlaying}
            >
              <FontAwesomeIcon icon={isPlaying ? faVolumeUp : faPlay} />
            </button>
          </div>
          <div className="flashcard-face flashcard-answer">
            <div className="flashcard-content">{backContent}</div>
            <button
              className={`play-button ${isPlaying ? 'playing' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlay(backContent, languageMode === 'english' ? 'th-TH' : 'en-US');
              }}
              disabled={isPlaying}
            >
              <FontAwesomeIcon icon={isPlaying ? faVolumeUp : faPlay} />
            </button>
          </div>
        </div>
      </div>
      <div className="playback-speed-control">
        <label htmlFor="playback-speed">Speed: {playbackSpeed.toFixed(2)}x</label>
        <input
          type="range"
          id="playback-speed"
          min="0.5"
          max="1"
          step="0.01"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <button onClick={debouncedOnCorrect}>Correct</button>
      <button onClick={debouncedOnIncorrect}>Incorrect</button>
    </div>
  );
}

export default Flashcard;
=======
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
>>>>>>> 5c6fa5765b8595fd5a1ddf0afbc5a26c9d8a1080
