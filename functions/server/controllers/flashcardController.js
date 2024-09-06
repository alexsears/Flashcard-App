const admin = require('firebase-admin');
const db = admin.firestore();

// Ensure that Firebase admin is initialized correctly
if (!admin.apps.length) {
  admin.initializeApp();
}

const getFlashcards = async (req, res) => {
  try {
    const firebaseUid = req.query.firebaseUid;
    const limit = parseInt(req.query.limit) || 3;

    if (!firebaseUid) {
      console.error('Firebase UID is missing');
      return res.status(400).json({ error: 'Firebase UID is required' });
    }

    const currentDate = admin.firestore.Timestamp.now();
    console.log(`Fetching flashcards for user: ${firebaseUid}, at: ${new Date().toLocaleString()}`);

    // Query to fetch due flashcards with a limit
    const dueCardsQuery = db.collectionGroup('LearningProgress')
      .where('firebaseUid', '==', firebaseUid)
      .where('nextReviewDate', '<=', currentDate)
      .orderBy('nextReviewDate') // To fetch the oldest due cards first
      .limit(limit);

    const dueCardsSnapshot = await dueCardsQuery.get();
    let cards = [];

    if (!dueCardsSnapshot.empty) {
      const dueCards = dueCardsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`Found ${dueCards.length} due flashcards for user: ${firebaseUid}`);

      const flashcardIds = dueCards.map(card => card.flashcardId);
      const flashcardsSnapshot = await db.collection('Flashcards')
        .where(admin.firestore.FieldPath.documentId(), 'in', flashcardIds)
        .get();

      const flashcardsMap = new Map(flashcardsSnapshot.docs.map(doc => [doc.id, doc.data()]));

      cards = dueCards.map(dueCard => {
        const flashcardData = flashcardsMap.get(dueCard.flashcardId) || {};
        return {
          id: dueCard.flashcardId,
          front: flashcardData.front,
          back: flashcardData.back,
          easeFactor: dueCard.easeFactor,
          interval: dueCard.interval,
          reviewCount: dueCard.reviewCount,
          nextReviewDate: dueCard.nextReviewDate.toDate(),
        };
      });

      console.log('Fetched flashcards:', cards);
    }

    // Send response with total number of due cards and the fetched set
    res.json({
      totalDueCards: dueCardsSnapshot.size,
      limitedCards: cards,
      hasMore: dueCardsSnapshot.size === limit,
    });
  } catch (err) {
    console.error('Error getting flashcards:', err);
    res.status(500).json({ error: 'An error occurred while getting flashcards' });
  }
};


const getFlashcard = async (req, res) => {
  const flashcardId = req.params.flashcardId;
  try {
    const flashcardRef = db.collection('Flashcards').doc(flashcardId);
    const doc = await flashcardRef.get();
    if (!doc.exists) {
      res.status(404).json({ error: `Flashcard with ID ${flashcardId} not found.` });
      return;
    }
    const flashcardData = doc.data();
    res.json({
      id: doc.id,
      ...flashcardData
    });
  } catch (error) {
    console.error('Error getting flashcard:', error);
    res.status(500).json({ error: 'An error occurred while trying to get flashcard.' });
  }
};

module.exports = {
  getFlashcards,
  getFlashcard
};
