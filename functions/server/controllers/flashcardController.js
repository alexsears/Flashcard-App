const admin = require('firebase-admin');

const getFlashcards = async (req, res) => {
  console.log('Received request for flashcards');
  console.log('User:', req.user);
  try {
    const db = admin.firestore();
    const flashcardsRef = db.collection('Flashcards'); // Note the capital 'F'
    console.log('Querying Firestore for flashcards');
    const snapshot = await flashcardsRef.limit(10).get();

    console.log('Flashcards snapshot size:', snapshot.size);

    if (snapshot.empty) {
      console.log('No flashcards found');
      return res.status(404).json({ message: 'No flashcards found' });
    }

    const flashcards = [];
    snapshot.forEach(doc => {
      flashcards.push({ id: doc.id, ...doc.data() });
    });

    console.log('Sending flashcards:', flashcards.length);
    res.json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    if (error.code === 7) {
      res.status(403).json({ error: 'Permission denied. Unable to access flashcards.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch flashcards' });
    }
  }
};

const getFlashcard = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const db = admin.firestore();
    const flashcardDoc = await db.collection('flashcards').doc(flashcardId).get();

    if (!flashcardDoc.exists) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }

    const flashcardData = { id: flashcardDoc.id, ...flashcardDoc.data() };
    res.json(flashcardData);
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    res.status(500).json({ error: 'Failed to fetch flashcard' });
  }
};

module.exports = {
  getFlashcards,
  getFlashcard, // Make sure to export the new function
};


