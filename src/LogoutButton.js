import React from 'react';
import { auth } from './firebaseConfig';


const handleLogout = async () => {
  await auth.signOut();
};

function LogoutButton() {
  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
