const admin = require('firebase-admin');
const db = admin.firestore();

exports.assignFlashcards = async (req, res) => {
  try {
    const firebaseUid = req.query.firebaseUid;
    const maxCardsPerSession = 20;

    // Fetch the flashcards
    const flashcardsCollection = db.collection('Flashcards');
    const flashcardSnap = await flashcardsCollection.get(); 
    const flashcards = flashcardSnap.docs.map(doc => ({...doc.data(), cardId: doc.id}));

    // Add a progress field to the User model
    const usersCollection = db.collection('Users');
    const userSnapshot = await usersCollection.doc(firebaseUid).get();
    const user = userSnapshot.data();
    if (!user) {
      console.error('User not found');
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (!flashcards.length) {
      console.error('No flashcards found in the database');
      res.status(500).json({ error: 'No flashcards found in the database' });
      return;
    }

    // Get the LearningProgress collection
    const learningProgressCollection = db.collection('LearningProgress');

    // Get all documents from the collection
    const learningProgressSnap = await learningProgressCollection.get();
    const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

    // Get the next maxCardsPerSession new flashcards with cardId greater than progress
    const newFlashcards = flashcards
      .filter(flashcard => flashcard.cardid > user.progress && !learningProgress.find(lp => lp.id.split('_')[1] === flashcard.cardId))
      .sort((a, b) => a.cardid - b.cardid)
      .slice(0, maxCardsPerSession);    

    // Update the user's progress if new cards were assigned
    if (newFlashcards.length > 0) {
      await usersCollection.doc(firebaseUid).update({ progress: newFlashcards[newFlashcards.length - 1].cardid });
    }
    if (!newFlashcards.length) {
      console.error('No new flashcards to assign for the user');
      res.status(500).json({ error: 'No new flashcards to assign for the user' });
      return;
    }

    // Get the next 20 new flashcards
    const newCardsToAssign = newFlashcards.slice(0, maxCardsPerSession);

    // Create Learning Progress entries for the new flashcards
    for (const flashcard of newCardsToAssign) {
      const id = `${firebaseUid}_${flashcard.cardId}`;
      await learningProgressCollection.doc(id).set({
        firebaseUid: firebaseUid,
        flashcardId: flashcard.cardId,
        nextReviewDate: admin.firestore.FieldValue.serverTimestamp(),
        interval: 1,
        reviewCount: 0,
        easeFactor: 2.5
      });
    }
    // Log the learning progress entries and flashcards
    // console.log('Learning progress entries:', learningProgress);
    
  
    // Log the response
    console.log('Response:', newCardsToAssign);
  
    // Return the assigned flashcards
    res.json(newCardsToAssign);
  } catch (err) {
    console.error('An error occurred when assigning flashcards:', err.message);
    res.status(500).json({ error: 'An error occurred when assigning flashcards', details: err.message });
  }
};

exports.getFlashcards = async (req, res) => {
  try {
    const firebaseUid = req.query.firebaseUid;
    const currentDate = new Date();
    const maxCardsPerSession = 20;

    // Get the LearningProgress collection
    const learningProgressCollection = db.collection('LearningProgress');

    // Get all documents from the collection
    const learningProgressSnap = await learningProgressCollection.get();
    const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

    // Fetch the user's progress
    const usersCollection = db.collection('Users');
    const userSnapshot = await usersCollection.doc(firebaseUid).get();
    const user = userSnapshot.data();

    if (!user) {
      console.error('User not found');
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Filter the learning progress entries for the user and that are due
    const dueCardsProgress = learningProgress.filter(entry => 
      new Date(entry.nextReviewDate.toDate()) <= currentDate && 
      entry.id.split('_')[0] === firebaseUid
    ).sort((a, b) => a.nextReviewDate.toDate() - b.nextReviewDate.toDate());

    // Fetch the flashcards
    const flashcardsCollection = db.collection('Flashcards');
    const flashcardSnap = await flashcardsCollection.get();
    const flashcards = flashcardSnap.docs.map(doc => ({...doc.data(), cardId: doc.id}));

    if (!flashcards.length) {
      console.error('No flashcards found in the database');
      res.status(500).json({ error: 'No flashcards found in the database' });
      return;
    }

    // If no due cards, assign new cards
    if (dueCardsProgress.length === 0) {
    // Filter the flashcards with cardId greater than progress
    const newFlashcards = flashcards
      .filter(flashcard => flashcard.cardid > user.progress && !learningProgress.find(lp => lp.id.split('_')[1] === flashcard.cardId))
      .sort((a, b) => a.cardid - b.cardid)
      .slice(0, maxCardsPerSession);

    // Update the user's progress if new cards were fetched
    if (newFlashcards.length > 0) {
      await usersCollection.doc(firebaseUid).update({ progress: newFlashcards[newFlashcards.length - 1].cardid });
    }

      // Get the next 20 new flashcards
      const newCardsToAssign = newFlashcards.slice(0, maxCardsPerSession);

      // Create Learning Progress entries for the new flashcards
      for (const flashcard of newCardsToAssign) {
        const id = `${firebaseUid}_${flashcard.cardId}`;
        await learningProgressCollection.doc(id).set({
          firebaseUid: firebaseUid,
          flashcardId: flashcard.cardId,
          nextReviewDate: admin.firestore.FieldValue.serverTimestamp(),
          interval: 1,
          reviewCount: 0,
          easeFactor: 2.5
        });
      }

      // Fetch the Learning Progress for the new flashcards
      const newLearningProgressSnap = await learningProgressCollection.get();
      const newLearningProgress = newLearningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

      // Map the new learning progress entries to their respective flashcards
      const newCards = newLearningProgress.map(lp => 
        flashcards.find(card => card.cardId === lp.id.split('_')[1])
      );

      // Log the learning progress entries and flashcards
      console.log('Learning progress entries:', newLearningProgress);
      
  
      // Log the response
      console.log('Response:', newCards);

      res.json(newCards);
    } else {
      // Limit the results
      dueCardsProgress.length = Math.min(dueCardsProgress.length, maxCardsPerSession);

      // Map the due learning progress entries to their respective flashcards
      const dueCards = dueCardsProgress.map(lp => 
        flashcards.find(card => card.cardId === lp.id.split('_')[1])
      );

      // Log the learning progress entries and flashcards
      console.log('Learning progress entries:', dueCardsProgress);
      
  
      // Log the response
      console.log('Response:', dueCards);

      res.json(dueCards);
    }
  } catch (err) {
    console.error('An error occurred when getting all flashcards:', err.message);
    res.status(500).json({ error: 'An error occurred when getting all flashcards', details: err.message });
  }
};
