import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

const ManagerConsole = () => {
  const [isManager, setIsManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          } else {
            window.close(); // Close the tab if not a manager
          }
        } catch (error) {
          console.error('Error checking manager status:', error);
          window.close(); // Close the tab on error
        }
      } else {
        window.close(); // Close the tab if no user is logged in
      }
      setIsLoading(false);
    };

    checkManagerStatus();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isManager) {
    return null; // This will prevent any flash of content before redirect
  }

  return (
    <div>
      <h1>Manager Console</h1>
      {/* Add manager console content here */}
    </div>
  );
};

export default ManagerConsole;
