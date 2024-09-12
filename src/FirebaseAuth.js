import React, { useCallback, useState } from 'react';
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
      console.log(`${new Date().toISOString()} - User signed in, refreshing token`);
      await refreshToken();
      const token = await user.getIdToken();
      console.log(`${new Date().toISOString()} - Token refreshed, sending request to ${endpoint}`);
      const response = await fetch(`${API_URL}${endpoint}`, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          uid: user.uid,
          email: user.email
        }),
      });
  
      if (!response.ok) throw new Error('Failed to sign up or log in on the server.');
      
      const data = await response.json();
      console.log(`${new Date().toISOString()} - Server response:`, data);
  
      if (data.user && data.user.score !== undefined) {
        console.log(`${new Date().toISOString()} - User ${user.uid} logged in with score: ${data.user.score}`);
      } else {
        console.log(`${new Date().toISOString()} - User ${user.uid} logged in, but score was not in the response`);
      }
  
      console.log(`${new Date().toISOString()} - Fetching additional user data`);
      const userResponse = await fetch(`${API_URL}/api/user/${user.uid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log(`${new Date().toISOString()} - User data from /api/user/:uid:`, userData);
        console.log(`${new Date().toISOString()} - User role: ${userData.role}`);
        if (userData.role === 'manager') {
          const newUrl = `${window.location.origin}/manager-console`;
          window.open(newUrl, '_blank');
        }
      }
    } catch (error) {
      console.error(`${new Date().toISOString()} - Error during server signup or log in:`, error);
      setError('Failed to complete login process. Please try again.');
    }
  }, []);
  

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
