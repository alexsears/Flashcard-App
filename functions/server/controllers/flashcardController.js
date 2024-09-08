const admin = require('firebase-admin');
const db = admin.firestore();

// Ensure that Firebase admin is initialized correctly
if (!admin.apps.length) {
  admin.initializeApp();
}

const getFlashcards = async (req, res) => {
  try {
    const firebaseUid = req.query.firebaseUid;
    const currentDate = admin.firestore.Timestamp.now();
    const maxCardsPerSession = 20;

    // Fetch the user's data (including score)
    const usersCollection = db.collection('Users');
    const userSnapshot = await usersCollection.doc(firebaseUid).get();
    const user = userSnapshot.data();

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const currentScore = user.score || 0;
    console.log(`Fetching flashcards for user: ${firebaseUid}, current score: ${currentScore}, at: ${currentDate.toDate().toLocaleString()}`);

    // Get the LearningProgress collection
    const learningProgressCollection = db.collection('LearningProgress');

    // Get all documents from the collection for this user
    const learningProgressSnap = await learningProgressCollection.where('firebaseUid', '==', firebaseUid).get();
    const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

    // Filter the learning progress entries that are due
    const dueCardsProgress = learningProgress.filter(entry => 
      entry.nextReviewDate.toDate() <= currentDate.toDate()
    ).sort((a, b) => a.nextReviewDate.toDate() - b.nextReviewDate.toDate());

    // Fetch the flashcards
    const flashcardsCollection = db.collection('Flashcards');
    const flashcardSnap = await flashcardsCollection.get();
    const flashcards = flashcardSnap.docs.map(doc => ({...doc.data(), cardId: doc.id}));

    if (!flashcards.length) {
      console.error('No flashcards found in the database');
      return res.status(500).json({ error: 'No flashcards found in the database' });
    }

    let responseCards;

    // If no due cards, assign new cards
    if (dueCardsProgress.length === 0) {
      // Filter the flashcards with cardId greater than progress
      const newFlashcards = flashcards
        .filter(flashcard => flashcard.cardid > user.progress && !learningProgress.find(lp => lp.flashcardId === flashcard.cardId))
        .sort((a, b) => a.cardid - b.cardid)
        .slice(0, maxCardsPerSession);

      // Update the user's progress if new cards were fetched
      if (newFlashcards.length > 0) {
        await usersCollection.doc(firebaseUid).update({ progress: newFlashcards[newFlashcards.length - 1].cardid });
      }

      // Create Learning Progress entries for the new flashcards
      for (const flashcard of newFlashcards) {
        const id = `${firebaseUid}_${flashcard.cardId}`;
        await learningProgressCollection.doc(id).set({
          firebaseUid: firebaseUid,
          flashcardId: flashcard.cardId,
          nextReviewDate: currentDate,
          interval: 1,
          reviewCount: 0,
          easeFactor: 2.5
        });
      }

      responseCards = newFlashcards;
    } else {
      // Limit the results
      dueCardsProgress.length = Math.min(dueCardsProgress.length, maxCardsPerSession);

      // Map the due learning progress entries to their respective flashcards
      responseCards = dueCardsProgress.map(lp => 
        flashcards.find(card => card.cardId === lp.flashcardId)
      ).filter(card => card !== undefined);
    }

    console.log('Response:', responseCards);

    res.json({
      cards: responseCards,
      score: currentScore,
      totalCards: responseCards.length
    });
  } catch (err) {
    console.error('An error occurred when getting flashcards:', err);
    res.status(500).json({ error: 'An error occurred when getting flashcards', details: err.message });
  }
};

// If you need the getFlashcard function, define it here
const getFlashcard = async (req, res) => {
  // Implementation of getFlashcard function
  // ...
};

module.exports = {
  getFlashcards,
  getFlashcard
};