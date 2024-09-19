const admin = require('firebase-admin');

// Use admin.firestore() to access Firestore
const db = admin.firestore();

const submitReview = async (req, res) => {
  try {
    const { userId, flashcardId, performanceRating } = req.body;
    
    // Your existing logic to save the review
    // For example:
    const reviewRef = await db.collection('Reviews').add({
      userId,
      flashcardId,
      performanceRating,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update the score
    const scoreIncrement = performanceRating === 'correct' ? 1 : 0;
    const userRef = db.collection('Users').doc(userId);
    
    const updatedScore = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error(`User with ID ${userId} not found.`);
      }
      const userData = userDoc.data();
      const newScore = (userData.score || 0) + scoreIncrement;
      transaction.update(userRef, { score: newScore });
      return newScore;
    });

    res.json({
      message: 'Review submitted successfully',
      reviewId: reviewRef.id,  // Use the actual review ID
      updatedScore
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review', details: error.message });
  }
};

module.exports = { submitReview };