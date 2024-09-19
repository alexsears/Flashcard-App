import React from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './components/Login';
import FlashcardList from './components/FlashcardList';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Flashcard App</h1>
      {user ? <FlashcardList /> : <Login />}
    </div>
  );
}

export default App;