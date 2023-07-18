import React, { useCallback, useState } from 'react';
import { app } from './firebaseConfig';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

function FirebaseAuth({ fetchFlashcards }) {
  const [error, setError] = useState(null);

  const handleSignUp = useCallback(async (event) => {
    event.preventDefault();
    const { email, password } = event.target.elements;
    try {
      await app.auth().createUserWithEmailAndPassword(email.value, password.value).then((userCredential) => {
        var user = userCredential.user;
        console.log('User ID after signing up:', user.uid);
        
        fetchFlashcards(user.uid);
      });
    } catch (error) {
      setError('Error signing up with email and password');
    }
  }, [fetchFlashcards]);

  const handleGoogleSignIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      await signInWithPopup(auth, provider).then((result) => {
        const user = result.user;
        console.log('User ID after signing in with Google:', user.uid);
        
        fetchFlashcards(user.uid);

        // ...rest of your code
      });
    } catch (error) {
      setError('Error signing in with Google');
    }
  }, [fetchFlashcards]);

  return (
    <div>
      <form onSubmit={handleSignUp}>
        <label>
          Email
          <input name="email" type="email" placeholder="Email" />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" />
        </label>
        <button type="submit">Sign Up</button>
        <button onClick={handleGoogleSignIn}>Sign In with Google</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

export default FirebaseAuth;
