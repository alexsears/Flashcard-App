const express = require('express');
const router = express.Router();
const { submitReview } = require('../controllers/reviewController');

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
const { authenticateUser } = require('../middleware/authenticateUser');

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
router.post('/signup', userController.postSignup);
router.post('/login', userController.login);

// Authenticated routes
router.use(authenticateFirebaseToken); // Apply authentication to all routes below this line

// User routes
router.get('/user/:userId', userController.getUser);
router.get('/learningprogress/:userId', userController.getLearningProgress);

// Flashcard routes
router.get('/flashcards', flashcardController.getFlashcards);
router.get('/flashcard/:flashcardId', flashcardController.getFlashcard);

// Review route
router.post('/review', reviewController.submitReview);

// Score routes
router.get('/score', scoreController.getScore);
router.post('/score', scoreController.postScore);
router.get('/dueFlashcards/:uid', scoreController.getDueFlashcardsCount);

// TTS routes
router.post('/synthesize', ttsController.synthesizeSpeech);

// Manager routes (with additional manager authentication)
router.use('/manager', authenticateManager); // Apply manager authentication to all manager routes
router.get('/manager', authenticateManager, managerController.openManagerConsole);
router.get('/manager/userStats', managerController.getUserStats);
router.get('/flashcardStats', managerController.getFlashcardStats);
router.get('/userProgress/:userId', managerController.getUserProgressOverTime);
router.get('/learningprogressstats/:userId', userController.getLearningProgressStats);

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

// Define your routes here
router.get('/example', (req, res) => {
  res.json({ message: 'Example route' });
});

// New score endpoint
router.get('/api/user/score', authenticateFirebaseToken, scoreController.getUserScore);

// New route for text-to-speech functionality
router.post('/api/synthesize-speech', ttsController.synthesizeSpeech);

// Manager console route
router.get('/manager', authenticateManager, managerController.openManagerConsole);

// Route for checking manager status
router.get('/check-manager-status', authenticateManager, (req, res) => {
  res.json({ isManager: true });
});

// Route for individual flashcards
router.get('/flashcard/:id', flashcardController.getFlashcard);

module.exports = router;