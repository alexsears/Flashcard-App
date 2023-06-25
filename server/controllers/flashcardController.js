// flashcardController.js

const Card = require('../models/Card');
const LearningProgress = require('../models/LearningProgress');

exports.getAllFlashcards = async (req, res) => {
  console.log('Received request for flashcards');
  try {
    const userId = req.query.userId;
    const level = req.query.level; // Get the level from query parameters.
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current date to start of the day.

    const dueCardsProgress = await LearningProgress.find({
      userId,
      nextReviewDate: { $lte: currentDate }
    }).sort({ nextReviewDate: 1 });

    console.log(`User ${userId} has ${dueCardsProgress.length} flashcards due for review.`);

    await LearningProgress.populate(dueCardsProgress, { path: 'flashcardId' });

    if (dueCardsProgress.length < 20) { 
      const cardsInLearningProgress = dueCardsProgress.map(item => item.flashcardId._id);
      const newCard = await Card.findOne({ 
        _id: { $nin: cardsInLearningProgress }, 
        level: level // Only fetch cards from the specified level.
      }).sort({ levelcard: 1 }); // Sort by the levelcard order.
      
      if (newCard) {
        const newProgress = new LearningProgress({ 
          userId, 
          flashcardId: newCard._id,
          reviewCount: 0, 
          easeFactor: 2.5, 
          lastReviewDate: null, 
          nextReviewDate: new Date(),
        });
      
        await newProgress.save(); 
        dueCardsProgress.push(newProgress);
      }
    }
      
    await LearningProgress.populate(dueCardsProgress, { path: 'flashcardId' });
    const dueCards = dueCardsProgress.map(item => item.flashcardId);
    res.json(dueCards); 
  } catch (err) {
    console.error('Error:', err); 
    res.status(500).json({ error: 'An error occurred when getting all flashcards', details: err.message });
  }
};



exports.postReview = async (req, res) => {
  try {
    const { userId, cardId, reviewResult, responseTime } = req.body;
    const learningProgress = await LearningProgress.findOne({ userId, flashcardId: cardId });

    if (!learningProgress) {
      return res.status(404).json({ error: 'Learning progress not found' });
    }

    learningProgress.reviewCount++;
    if (learningProgress.reviewCount === 1) {
      learningProgress.nextReviewDate = new Date(Date.now() + 1 * 60 * 1000);
    } else if (learningProgress.reviewCount === 2) {
      learningProgress.nextReviewDate = new Date(Date.now() + 10 * 60 * 1000);
    } else {
      // Check if the user answered correctly in less than 5 seconds
      if (reviewResult === 'correct' && responseTime <= 5000) {
        learningProgress.easeFactor += 0.15;
      } else {
        learningProgress.easeFactor = Math.max(1.3, learningProgress.easeFactor - 0.15);
      }
      learningProgress.nextReviewDate = new Date(Date.now() + learningProgress.easeFactor * 24 * 60 * 60 * 1000);
    }

    await learningProgress.save();
    res.json({ success: true });
  } 
  catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'An error occurred when posting review', details: err.message });
  }
};
