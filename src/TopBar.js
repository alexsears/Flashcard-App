import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import usaFlag from './usa_flag.png';
import thaiFlag from './thai_flag.png';
import bookLogo from './book.png';

function TopBar({ languageMode, onLanguageChange, score, onLogout }) {
  const handleLanguageToggle = () => {
    console.log('Language toggle clicked');
    console.log('Current language mode:', languageMode);
    onLanguageChange(languageMode === 'english' ? 'thai' : 'english');
    console.log('Language change requested');
  };

  return (
    <header className="top-bar">
      <div className="left-section">
        <img src={bookLogo} alt="App Logo" className="app-logo" />
      </div>

      <div className="right-section">
        <div 
        className="language-toggle-switch" 
        onClick={handleLanguageToggle}
        role="switch" 
        aria-checked={languageMode === 'english'}
        aria-label={languageMode === 'english' ? "Switch to Thai" : "Switch to English"}
      >
        <img src={usaFlag} alt="English" className="flag-icon usa-flag" title="Switch to English" />
        <div className={`toggle-slider ${languageMode === 'english' ? 'english-mode' : 'thai-mode'}`}></div>
        <img src={thaiFlag} alt="Thai" className="flag-icon thai-flag" title="Switch to Thai" />
      </div>
        <div className="score-container">
          <span>Score: </span>
          <div className="digital-counter">
            {score.toString().padStart(4, '0').split('').map((digit, index) => (
              <div key={index} className="digit">{digit}</div>
            ))}
          </div>
        </div>
        <button onClick={onLogout} className="logout-button" aria-label="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
        </button>
      </div>
    </header>
  );
}

export default TopBar;