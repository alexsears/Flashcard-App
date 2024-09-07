import React, { useCallback, useState } from 'react';
<<<<<<< HEAD
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { app } from './firebaseConfig';
import bookImage from './book.jpg';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

function FirebaseAuth() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

  const clearError = () => setError(null);

  const validateInput = (email, password) => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters long');
      return false;
    }
    return true;
  };

  const refreshToken = async () => {
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        console.log('Token refreshed');
      } else {
        console.error('No current user to refresh token for');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      setError('Failed to refresh the token. Please try signing in again.');
    }
  };
  

  const handleSignUp = useCallback(async (event) => {
    event.preventDefault();
    clearError();
    setLoading(true);
    const { email, password } = event.target.elements;

    if (!email || !password) {
      setError('Email and password inputs are required.');
      setLoading(false);
      return;
    }
    

    try {
      await signInWithEmailAndPassword(auth, email.value, password.value)
        .then(userCredential => onSignInSuccess(userCredential, false));
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        try {
          await createUserWithEmailAndPassword(auth, email.value, password.value)
            .then(userCredential => {
              sendEmailVerification(userCredential.user)
                .then(() => console.log('Verification email sent'))
                .catch((error) => console.error('Error sending verification email', error));
              onSignInSuccess(userCredential, true);
            });
        } catch (error) {
          console.error(error);
          setError(`Error signing up: ${error.message}`);
        }
      } else {
        console.error(error);
        setError(`Error signing in: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const handleGoogleSignIn = useCallback(async () => {
    clearError();
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider)
        .then(result => onSignInSuccess(result, false));
    } catch (error) {
      console.error(error);
      setError(`Error signing in with Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const onSignInSuccess = useCallback(async (userCredential, isNewUser) => {
    const user = userCredential.user;
    const endpoint = isNewUser ? '/api/signup' : '/api/login';
  
    try {
      await refreshToken();
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}${endpoint}`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          uid: user.uid,
          email: user.email // Send email as well
        }),
      });
  
      if (!response.ok) throw new Error('Failed to sign up or log in on the server.');
      
      const data = await response.json();
      console.log('Server response:', data);
  
      const userResponse = await fetch(`${API_URL}/api/user/${user.uid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log(`User role: ${userData.role}`);
        if (userData.role === 'manager') {
          const newUrl = `${window.location.origin}/manager-console`;
          window.open(newUrl, '_blank');
        }
      }
    } catch (error) {
      console.error('Error during server signup or log in:', error);
      setError('Failed to complete login process. Please try again.');
    }
  }, []);
  

  return (
    <div className="container">
      <form onSubmit={handleSignUp} className="form">
        <img src={bookImage} alt="Book" className="book-image" />
        <Input label="Email" type="email" name="email" />
        <Input label="Password" type="password" name="password" />
        <Button type="submit" className="button-signup" disabled={loading}>
          {loading ? 'Processing...' : 'Sign Up / Sign In'}
        </Button>
        <Button onClick={handleGoogleSignIn} className="button-google" disabled={loading}>
          {loading ? 'Processing...' : 'Sign In with Google'}
        </Button>
        {error && <p className="error-message">{error}</p>}
=======
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
>>>>>>> 5c6fa5765b8595fd5a1ddf0afbc5a26c9d8a1080
      </form>
    </div>
  );
}

<<<<<<< HEAD
const Input = ({ label, type, name }) => (
  <label className="label">
    {label}
    <input 
      name={name} 
      type={type} 
      placeholder={label} 
      className="input" 
    />
  </label>
);

const Button = ({ children, type, onClick, className }) => (
  <button 
    type={type} 
    onClick={onClick} 
    className={`button ${className}`}
  >
    {children}
  </button>
);

export default FirebaseAuth;
=======
export default FirebaseAuth;
>>>>>>> 5c6fa5765b8595fd5a1ddf0afbc5a26c9d8a1080
