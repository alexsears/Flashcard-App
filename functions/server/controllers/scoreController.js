const admin = require('firebase-admin');
const db = admin.firestore();

// Function to get the user's score
const getScore = async (req, res) => {
  try {
    const { uid } = req.query;
    console.log('getScore - uid:', uid);

    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userDoc = await db.collection('Users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: `User with ID ${uid} not found.`,
      });
    }

    const user = userDoc.data();
    console.log('getScore - User data:', user);

    res.json({
      score: user.score || 0, // Default to 0 if score is not defined
    });
  } catch (error) {
    console.error('Error in getScore:', error);
    res.status(500).json({
      error: 'An error occurred while trying to get the score.',
      details: error.message
    });
  }
};

// Function to update (increment) the user's score using a transaction
const postScore = async (req, res) => {
  try {
    const { uid } = req.body;
    console.log('postScore - uid:', uid);

    if (!uid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const userRef = db.collection('Users').doc(uid);

    // Run the transaction
    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error(`User with ID ${uid} not found.`);
      }

      const userData = userDoc.data();
      const newScore = (userData.score || 0) + 1;

      transaction.update(userRef, { score: newScore });

      return newScore;
    });

    console.log(`postScore - Updated score for user ${uid}:`, result);

    res.json({
      message: `Score for user with ID ${uid} updated successfully.`,
      updatedScore: result,
    });
  } catch (error) {
    console.error('Error in postScore:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: 'An error occurred while trying to update the score.',
        details: error.message
      });
    }
  }
};

// Function to get the count of due flashcards for a user
const getDueFlashcardsCount = async (req, res) => {
  const uid = req.params.uid;

  if (!uid) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get the user document
    const userDoc = await db.collection('Users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Query to get the count of due flashcards
    const learningProgressSnapshot = await db.collection('LearningProgress')
      .where('firebaseUid', '==', uid)
      .where('nextReviewDate', '<=', admin.firestore.Timestamp.now())
      .get();

    const dueFlashcardsCount = learningProgressSnapshot.size;
    console.log(`getDueFlashcardsCount - User ${uid} has ${dueFlashcardsCount} due flashcards`);

    res.json({ dueFlashcardsCount });
  } catch (error) {
    console.error('Error in getDueFlashcardsCount:', error);
    res.status(500).json({
      error: 'An error occurred while getting due flashcards count.',
      details: error.message
    });
  }
};

// Export all functions
module.exports = {
  getScore,
  postScore,
  getDueFlashcardsCount
};