// reviewController.js

const LearningProgress = require('../models/LearningProgress');

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