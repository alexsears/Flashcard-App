const express = require('express');
const router = express.Router();
const { postSignup, postLogin } = require('../controllers/userController');
const { getFlashcards, assignFlashcards } = require('../controllers/flashcardController');
const { postReview } = require('../controllers/reviewController');
const { getScore, postScore } = require('../controllers/scoreController');

router.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// User routes
router.post('/signup', postSignup);
router.post('/login', postLogin);

// Flashcards routes
router.get('/flashcards', getFlashcards);
router.get('/assignFlashcards', assignFlashcards);

// Review routes
router.post('/review', postReview);

// Score routes
router.get('/score', getScore);
router.post('/score', postScore);

// Error handling middleware
router.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


module.exports = router;
