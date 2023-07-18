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




