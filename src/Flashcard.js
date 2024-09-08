import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function Flashcard({ flashcard, onCorrect, onIncorrect, languageMode, currentUser, setScore, token }) {
  console.log('Flashcard component rendered with:', {
    flashcard,
    currentUser,
    languageMode,
    token
  });
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
    console.log('submitReview called with:', {
      currentUser,
      flashcard,
      performanceRating
    });
  
    if (!currentUser) {
      console.error('currentUser is missing');
      return;
    }
    if (!currentUser.uid) {
      console.error('currentUser.uid is missing');
      return;
    }
    if (!flashcard) {
      console.error('flashcard is missing');
      return;
    }
    if (!flashcard.id && !flashcard.cardId) {
      console.error('flashcard.id and flashcard.cardId are missing');
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firebaseUid: currentUser.uid,
          flashcardId: flashcard.id || flashcard.cardId,
          performanceRating
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log(`${new Date().toISOString()} - Review submitted. Server response:`, result);
      
      if (result.updatedScore !== undefined) {
        console.log(`${new Date().toISOString()} - Updating score to:`, result.updatedScore);
        setScore(result.updatedScore);
        console.log('Score updated to:', result.updatedScore);
      }
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error submitting review:`, error);
    }
  }, [currentUser, flashcard, setScore, token, API_URL]);  
  const debouncedOnCorrect = useCallback(
    debounce(() => {
      console.log(`${new Date().toISOString()} - Correct answer selected (right border)`);
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
      console.log(`${new Date().toISOString()} - Incorrect answer selected (left border)`);
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
        console.log(`${new Date().toISOString()} - Left border clicked (Incorrect)`);
        debouncedOnIncorrect();
      } else if (clickedPosition > 0.9) {
        console.log(`${new Date().toISOString()} - Right border clicked (Correct)`);
        debouncedOnCorrect();
      } else {
        console.log(`${new Date().toISOString()} - Card flipped`);
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
    </div>
  );
}

export default Flashcard;