import React, { useState } from 'react';
import './styles.css';
import usaFlag from './usa_flag.png';  // Ensure correct path
import thaiFlag from './thai_flag.png';  // Ensure correct path

function TopBar({ currentUser, score, onLogout, onLanguageChange }) {
  const [isEnglish, setIsEnglish] = useState(true);

  const handleLanguageToggle = () => {
    setIsEnglish(!isEnglish);
    onLanguageChange(!isEnglish ? 'english' : 'thai');
  };

  return (
    <header className="top-bar">
      <div className="left-section">
        <h1>Flashcard App</h1>
        <button onClick={onLogout} className="logout-button" aria-label="Logout">
          Logout
        </button>
      </div>

      <div className="center-section">
        <div 
          className="language-toggle-switch" 
          onClick={handleLanguageToggle}
          role="switch" 
          aria-checked={isEnglish}
          aria-label={isEnglish ? "Switch to Thai" : "Switch to English"}
        >
          <img src={usaFlag} alt="English" className="flag-icon usa-flag" title="Switch to English" />
          <div className={`toggle-slider ${isEnglish ? 'english-mode' : 'thai-mode'}`}></div>
          <img src={thaiFlag} alt="Thai" className="flag-icon thai-flag" title="Switch to Thai" />
        </div>
      </div>

      <div className="right-section">
        <div className="score-container">
          <span>Score: {score}</span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
