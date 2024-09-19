import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { app } from './firebaseConfig';
import bookImage from './book.jpg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

console.log('Current API_URL:', API_URL);

function FirebaseAuth() {
  console.log(`${new Date().toISOString()} - Rendering FirebaseAuth`);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const auth = getAuth();

  const clearError = () => setError(null);

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

  const onSignInSuccess = useCallback(async (userCredential, isNewUser) => {
    const user = userCredential.user;
    const endpoint = '/login'; // Always use login endpoint

    try {
      console.log(`${new Date().toISOString()} - User signed in, refreshing token`);
      await refreshToken();
      const token = await user.getIdToken();
      console.log(`${new Date().toISOString()} - Token refreshed, sending request to ${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      console.log('Before login attempt');
      // Your login logic here
      console.log('After login attempt, response:', response);
      console.log('Current state - isLoggedIn:', isLoggedIn, 'userData:', userData);

      if (!response.ok) throw new Error('Failed to sign up or log in on the server.');
      
      const data = await response.json();
      console.log(`${new Date().toISOString()} - Server response:`, data);

      setUserData(data.user);
      setIsLoggedIn(true);

      console.log(`${new Date().toISOString()} - Login successful, user data:`, data.user);

      if (data.user.role === 'manager') {
        const newUrl = `${window.location.origin}/manager-console`;
        window.open(newUrl, '_blank');
      }
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error during server signup or log in:`, error);
      setError('Failed to complete login process. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [refreshToken]);

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
          setLoading(false);
        }
      } else {
        console.error(error);
        setError(`Error signing in: ${error.message}`);
        setLoading(false);
      }
    }
  }, [auth, onSignInSuccess]);

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
      setLoading(false);
    }
  }, [auth, onSignInSuccess]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt started');
    // Your login logic here
    console.log('Login attempt completed');
  };

  if (isLoggedIn && userData) {
    return (
      <div>
        <h2>Welcome, {userData.email}</h2>
        <p>Your role: {userData.role}</p>
        <p>Score: {userData.score}</p>
        <p>Due cards: {userData.dueCards}</p>
        {/* Render additional user information or components here */}
      </div>
    );
  }

  return (
    <div className="login-container">
      <img src={bookImage} alt="Logo" className="logo" />
      <h2>Welcome</h2>
      <form onSubmit={handleSignUp}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" required />
          <i className="fas fa-envelope"></i>
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
          <i className="fas fa-lock"></i>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Sign Up / Sign In'}
        </button>
      </form>
      <button onClick={handleGoogleSignIn} className="btn btn-google" disabled={loading}>
        {loading ? 'Processing...' : 'Sign In with Google'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default FirebaseAuth;
