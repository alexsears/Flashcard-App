const admin = require('firebase-admin');

// Check if Firebase app is already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const MIN_REVIEW_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const postReview = async (req, res) => {
  try {
    const { firebaseUid, flashcardId, performanceRating } = req.body;
    console.log('Received review request:', req.body);

    const learningProgressRef = db.collection('LearningProgress').doc(`${firebaseUid}_${flashcardId}`);
    const learningProgressSnap = await learningProgressRef.get();

    if (!learningProgressSnap.exists) {
      return res.status(404).json({
        error: `Learning progress not found for user with ID ${firebaseUid} and flashcard with ID ${flashcardId}.`,
      });
    }

    const learningProgress = learningProgressSnap.data();
    const now = admin.firestore.Timestamp.now();

    // Check if the card is due for review
    if (learningProgress.nextReviewDate > now) {
      const timeUntilDue = learningProgress.nextReviewDate.toDate() - now.toDate();
      if (timeUntilDue > MIN_REVIEW_INTERVAL) {
        return res.status(400).json({
          error: 'This card is not due for review yet.',
          nextReviewDate: learningProgress.nextReviewDate.toDate()
        });
      }
    }

    // Set quality of recall based on performance rating
    let qualityOfRecall;
    switch (performanceRating) {
      case 'correct':
        qualityOfRecall = 5; // Full recall
        break;
      case 'incorrect':
        qualityOfRecall = 0; // No recall
        break;
      default:
        return res.status(400).json({ error: 'Invalid performanceRating. Must be "correct" or "incorrect".' });
    }

    // Increment the review count
    learningProgress.reviewCount += 1;

    // Update the ease factor (SuperMemo algorithm logic)
    const newEaseFactor = learningProgress.easeFactor + 0.1 - (5 - qualityOfRecall) * (0.08 + (5 - qualityOfRecall) * 0.02);
    learningProgress.easeFactor = Math.max(1.3, Number(newEaseFactor.toFixed(4)));

    // Determine the new interval based on the review count
    if (learningProgress.reviewCount === 1) {
      learningProgress.interval = 1;
    } else if (learningProgress.reviewCount === 2) {
      learningProgress.interval = 6;
    } else {
      learningProgress.interval = Math.round(learningProgress.interval * learningProgress.easeFactor);
    }

    // Update the next review date
    const nextReviewDate = new Date(now.toDate());
    nextReviewDate.setDate(nextReviewDate.getDate() + learningProgress.interval);
    learningProgress.nextReviewDate = admin.firestore.Timestamp.fromDate(nextReviewDate);

    await learningProgressRef.update(learningProgress);

    console.log(`Updated learning progress for card ${flashcardId}:`, {
      nextReviewDate: learningProgress.nextReviewDate.toDate(),
      interval: learningProgress.interval,
      easeFactor: learningProgress.easeFactor,
      reviewCount: learningProgress.reviewCount
    });

    res.json({
      message: 'Review saved successfully.',
      learningProgress,
    });
  } catch (error) {
    console.error('Error in postReview:', error);
    res.status(500).json({
      error: 'An error occurred while trying to save the review.',
      details: error.message
    });
  }
};

module.exports = {
  postReview
};