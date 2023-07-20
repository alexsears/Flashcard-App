const admin = require('firebase-admin');
const db = admin.firestore();

exports.postReview = async (req, res) => {
  try {
    const { firebaseUid, flashcardId, performanceRating } = req.body;
    console.log('Flashcard ID:', flashcardId);  // Log the flashcard ID

    // Get the LearningProgress document
    const learningProgressRef = db.collection('LearningProgress').doc(`${firebaseUid}_${flashcardId}`);
    const learningProgressSnap = await learningProgressRef.get();

    if (!learningProgressSnap.exists) {
      return res.status(404).json({
        error: `Learning progress not found for user with ID ${firebaseUid} and flashcard with ID ${flashcardId}.`,
      });
    }

    const learningProgress = learningProgressSnap.data();
    console.log('Learning progress:', learningProgress);  // Log the learning progress

    let qualityOfRecall;
    if (performanceRating === 'correct') {
      qualityOfRecall = 5;
    } else if (performanceRating === 'incorrect') {
      qualityOfRecall = 0;
    }

    learningProgress.reviewCount += 1;

    learningProgress.easeFactor = Math.max(1.3, learningProgress.easeFactor + 0.1 - (5 - qualityOfRecall) * (0.08 + (5 - qualityOfRecall) * 0.02));

    if (qualityOfRecall < 3) {
      learningProgress.reviewCount = 0;
    }

    if (learningProgress.reviewCount <= 1) {
      learningProgress.interval = 1;
    } else if (learningProgress.reviewCount === 2) {
      learningProgress.interval = 6;
    } else {
      learningProgress.interval = Math.round(learningProgress.interval * learningProgress.easeFactor);
    }

    learningProgress.nextReviewDate = admin.firestore.Timestamp.fromDate(new Date(Date.now() + learningProgress.interval * 24 * 60 * 60 * 1000)); 
    learningProgress.lastReviewDate = admin.firestore.Timestamp.fromDate(new Date());
    //log flashcard front
    // Get the flashcardId from the learningProgress object
    const flashcardIds = learningProgress.flashcardId;

    // Fetch the flashcard object using the flashcardId
    const flashcardRef = db.collection('Flashcards').doc(flashcardIds);
    const flashcardSnap = await flashcardRef.get();
    const flashcard = flashcardSnap.data();

    // Now you can access flashcardFront
    console.log('front:', flashcard.front);

    console.log('easeFactor:', learningProgress.easeFactor);  // Log the ease factor
    console.log('interval:', learningProgress.interval);  // Log the interval
    console.log('Review count:', learningProgress.reviewCount);  // Log the review count
    console.log('Next review date:', learningProgress.nextReviewDate.toDate());  // Log the next review date
    await learningProgressRef.update(learningProgress);
    //console.log('Updated learning progress:', learningProgress);  // Log the updated learning progress

    if(performanceRating === 'correct'){
      const userRef = db.collection('Users').doc(firebaseUid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(404).json({
          error: `User not found with ID ${firebaseUid}.`,
        });
      }

      const user = userSnap.data();
      //console.log('add 1')
      //user.score = (user.score || 0) + 1; // Increment user's score by 1

      await userRef.update(user);
    }

    res.json({
      message: 'Review saved successfully.',
      learningProgress,
    });
  } catch (error) {
    console.error('Error in postReview:', error);
    res.status(500).json({
      error: 'An error occurred while trying to save the review.',
    });
  }
};
