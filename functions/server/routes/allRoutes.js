const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/userController');
const flashcardController = require('../controllers/flashcardController');
const reviewController = require('../controllers/reviewController');
const scoreController = require('../controllers/scoreController');
const ttsController = require('../controllers/ttsController');
const managerController = require('../controllers/managerController');

// Import middleware
const { authenticateFirebaseToken } = require('../middleware/FirebaseToken');
const { authenticateManager } = require('../middleware/authenticateManager');

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// User routes
router.post('/signup', userController.postSignup);
router.post('/login', userController.postLogin);
router.get('/user/:userId', userController.getUser);
router.get('/learningprogress/:userId', userController.getLearningProgress);
router.get('/learningprogressstats/:userId', authenticateManager, userController.getLearningProgressStats);

// Flashcard routes
router.get('/flashcards', validateFlashcardsQuery, flashcardController.getFlashcards);
router.get('/flashcard/:flashcardId', flashcardController.getFlashcard);

// Review routes
router.post('/review', reviewController.postReview);

// Score routes
router.get('/score', scoreController.getScore);
router.post('/score', scoreController.postScore);
router.get('/dueFlashcards/:uid', scoreController.getDueFlashcardsCount);

// TTS routes
router.post('/synthesize', ttsController.synthesizeSpeech);

// Manager routes (with authentication middleware)
router.get('/userStats', authenticateFirebaseToken, authenticateManager, managerController.getUserStats);
router.get('/usageStats', authenticateFirebaseToken, authenticateManager, managerController.getUsageStats);
router.get('/flashcardStats', authenticateFirebaseToken, authenticateManager, managerController.getFlashcardStats);
router.get('/userProgress/:userId', authenticateFirebaseToken, authenticateManager, managerController.getUserProgressOverTime);

// Middleware for flashcards query validation
function validateFlashcardsQuery(req, res, next) {
  if (!req.query.firebaseUid) {
    return res.status(400).json({ error: 'firebaseUid query parameter is required' });
  }
  next();
}

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Catch-all for undefined routes
router.all('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = router;