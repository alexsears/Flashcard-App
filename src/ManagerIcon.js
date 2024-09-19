import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

const ManagerIcon = () => {
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    const checkManagerStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          const response = await fetch('/api/check-manager-status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            setIsManager(true);
          }
        } catch (error) {
          console.error('Error checking manager status:', error);
        }
      }
    };

    checkManagerStatus();
  }, []);

  const handleClick = () => {
    if (isManager) {
      window.open('/manager', '_blank');
    } else {
      alert('You do not have manager access.');
    }
  };

  if (!isManager) return null;

  return (
    <button onClick={handleClick}>
      Open Manager Console
    </button>
  );
};

export default ManagerIcon;