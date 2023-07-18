
const express = require('express');
const router = express.Router();
const { getAllFlashcards } = require('../controllers/flashcardController');

router.get('/', getAllFlashcards);

module.exports = router;