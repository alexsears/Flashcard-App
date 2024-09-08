const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    apiUrl: 'http://localhost:3001/api',
    firebaseConfig: JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || '{}'),
  },
  production: {
    apiUrl: '/api',
    firebaseConfig: JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || '{}'),
  },
};

export default config[env];