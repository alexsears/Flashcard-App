import React from 'react';
import { auth } from './firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faTools } from '@fortawesome/free-solid-svg-icons';

const handleLogout = async () => {
  await auth.signOut();
};

const handleOpenManagerConsole = () => {
  const newUrl = `${window.location.origin}/manager-console`;
  window.open(newUrl, '_blank');
};

function LogoutButton({ role }) {  // Add role as a prop
  return (
    <div>
      <button className="logout-button" onClick={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>
      {role === 'manager' && (  // Only render the button if role is 'manager'
        <button className="manager-console-button" onClick={handleOpenManagerConsole}>
          <FontAwesomeIcon icon={faTools} /> Manager Console
        </button>
      )}
    </div>
  );
}

export default LogoutButton;
