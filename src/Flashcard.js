import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash';
import { submitReview, fetchWithRetry } from './utils/api';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function Flashcard({ flashcard, onNextCard, languageMode, currentUser, token, setScore }) {
  const frontContent = useMemo(() => languageMode === 'english' ? flashcard.front : flashcard.back, [flashcard, languageMode]);
  const backContent = useMemo(() => languageMode === 'english' ? flashcard.back : flashcard.front, [flashcard, languageMode]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStatus, setCardStatus] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    setCardStatus('');
    setIsFlipped(false);
  }, [flashcard]);

  const submitReview = async ({ currentUser, flashcard, performanceRating }) => {
    console.log('submitReview called with:', { currentUser, flashcard, performanceRating, token });
    
    if (!token) {
      console.error('No token available. Please log in again.');
      return;
    }

    try {
      console.log('Sending review request to:', `${API_URL}/api/review`);
      const response = await fetchWithRetry(`${API_URL}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser.uid,
          flashcardId: flashcard.id,
          performanceRating
        })
      });

      const data = await response.json();
      console.log('Review submitted successfully:', data);

      if (data.updatedScore !== undefined) {
        console.log('New score received:', data.updatedScore);
        setScore(data.updatedScore);  // Use setScore here
      }

      onNextCard();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const debouncedOnCorrect = useMemo(() => 
    debounce(() => {
      setCardStatus('correct');
      submitReview({ currentUser, flashcard, performanceRating: 'correct' });
      setTimeout(() => {
        onNextCard();
        setCardStatus('');
      }, 300);
    }, 500, { leading: true, trailing: false }),
    [onNextCard, submitReview]
  );

  const debouncedOnIncorrect = useMemo(() => 
    debounce(() => {
      setCardStatus('incorrect');
      submitReview({ currentUser, flashcard, performanceRating: 'incorrect' });
      setTimeout(() => {
        onNextCard();
        setCardStatus('');
      }, 300);
    }, 500, { leading: true, trailing: false }),
    [onNextCard, submitReview]
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
        const response = await fetchWithRetry(`${API_URL}/api/synthesize-speech`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
        URL.revokeObjectURL(url);  // Clean up the URL after playing
      } catch (error) {
        console.error('Error playing audio:', error);
        // Here you might want to show an error message to the user
      } finally {
        setIsPlaying(false);
      }
    },
    [playbackSpeed, token]
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

export default React.memo(Flashcard);