const admin = require('firebase-admin');
const db = admin.firestore();

async function createUser(uid, userCollection, flashcardsCollection, learningProgressCollection) {
  const userDoc = userCollection.doc(uid);

  // Fetch the flashcards
  const flashcardSnap = await flashcardsCollection.orderBy('cardid').get();

  // Convert the documents to JS objects and include the document id, then sort them by id
  const flashcards = flashcardSnap.docs.map(doc => ({...doc.data(), cardId: doc.id})).sort((a, b) => Number(a.cardid) - Number(b.cardid));

  for (let i = 0; i < 20 && i < flashcards.length; i++) {
    const id = `${uid}_${flashcards[i].cardId}`;
    await learningProgressCollection.doc(id).set({
      firebaseUid: uid,
      flashcardId: flashcards[i].cardId,
      nextReviewDate: admin.firestore.FieldValue.serverTimestamp(),
      interval: 1,
      reviewCount: 0,
      easeFactor: 2.5
    });
  }

  const newUser = { 
    firebaseUid: uid, 
    score: 0,
    dateCreated: admin.firestore.FieldValue.serverTimestamp(), 
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    progress: flashcards[Math.min(19, flashcards.length - 1)].cardid  // Set progress to the last assigned flashcard's cardid
  };
  
  await userDoc.set(newUser);

  return newUser;
}

exports.postSignup = async (req, res) => {
  try {
    const { uid } = req.body;
    const userCollection = db.collection('Users');
    const userDoc = userCollection.doc(uid);
    const userSnap = await userDoc.get(); 
    const user = userSnap.data();
  
    if (user) {
      return res.status(409).json({ error: `User with ID ${uid} already exists.` });
    }
  
    const flashcardsCollection = db.collection('Flashcards');
    const learningProgressCollection = db.collection('LearningProgress');
    const newUser = await createUser(uid, userCollection, flashcardsCollection, learningProgressCollection);
        
    res.status(201).json({ message: `User with ID ${uid} signed up successfully.`, newUser });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'An error occurred while trying to sign up.', details: error.message });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { uid } = req.body;
    const userCollection = db.collection('Users');
    const userDoc = userCollection.doc(uid);
    let userSnap = await userDoc.get();
    let user = userSnap.data();

    const flashcardsCollection = db.collection('Flashcards');
    //const flashcardsCollection = db.collection('Flashcards');
    let learningProgressCollection = db.collection('LearningProgress');

    if (!user) {
      console.log(`User with ID ${uid} not found. Signing up...`);

      // User creation code here:
      const flashcardSnap = await flashcardsCollection.orderBy('cardid').get();
      const flashcards = flashcardSnap.docs.map(doc => ({...doc.data(), cardId: doc.id})).sort((a, b) => Number(a.cardId) - Number(b.cardId));

      for (let i = 0; i < 20 && i < flashcards.length; i++) {
        const id = `${uid}_${flashcards[i].cardId}`;
        await learningProgressCollection.doc(id).set({
          firebaseUid: uid,
          flashcardId: flashcards[i].cardId,
          nextReviewDate: admin.firestore.FieldValue.serverTimestamp(),
          interval: 1,
          reviewCount: 0,
          easeFactor: 2.5
        });
      }

      const newUser = { 
        firebaseUid: uid, 
        score: 0,
        dateCreated: admin.firestore.FieldValue.serverTimestamp(), 
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        progress: flashcards[Math.min(19, flashcards.length - 1)].cardid  // Set progress to the last assigned flashcard's cardid
      };
      
      await userDoc.set(newUser);
      user = newUser;
    } else {
      await userDoc.update({ lastLogin: admin.firestore.FieldValue.serverTimestamp() });
    }
  
      // Get the LearningProgress collection
      // const learningProgressCollection = db.collection('LearningProgress');
  
      // Get all documents from the collection
      const learningProgressSnap = await learningProgressCollection.where('firebaseUid', '==', uid).get();
  
      // Convert the documents to JS objects and include the document id
      const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));
  
      // Check if there are any due cards
      const dueCards = learningProgress.filter(lp => new Date(lp.nextReviewDate.toDate()) <= new Date());
  
      // Fetch the flashcards
      // const flashcardsCollection = db.collection('Flashcards');
      const flashcardSnap = await flashcardsCollection.orderBy('cardid').get();
      const flashcards = flashcardSnap.docs.map(doc => ({...doc.data(), cardId: doc.id})).sort((a, b) => Number(a.cardId) - Number(b.cardId));
  
      // If there are no due cards, fetch new cards
      if (dueCards.length === 0) {
        // Filter out the flashcards that already have Learning Progress documents
        console.log("no due cards, fetching");
        const newFlashcards = flashcards.filter(flashcard => 
          !learningProgress.find(lp => lp.flashcardId === flashcard.cardId)
        );
      
        // Limit the results
        newFlashcards.length = Math.min(newFlashcards.length, 20);
      
        // Create Learning Progress entries for the new flashcards
        for (const flashcard of newFlashcards) {
          const id = `${uid}_${flashcard.cardId}`;
          await learningProgressCollection.doc(id).set({
            firebaseUid: uid,
            flashcardId: flashcard.cardId, // use cardId instead of id
            nextReviewDate: admin.firestore.FieldValue.serverTimestamp(),
            interval: 1,
            reviewCount: 0,
            easeFactor: 2.5
          });
        }
              // Fetch the Learning Progress for the new flashcards
        const newLearningProgressSnap = await learningProgressCollection.where('firebaseUid', '==', uid).get();
        const newLearningProgress = newLearningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));
        
        // Map the new learning progress entries to their respective flashcards
        const newCards = newLearningProgress.map(lp => 
          flashcards.find(card => card.cardId === lp.flashcardId)
        );
  
        res.json({
          message: `User with ID ${uid} logged in successfully.`,
          user: { ...user, score: user.score },  // include score in the response
          newCards
        });
      } else {
        res.json({
          message: `User with ID ${uid} logged in successfully.`,
          user: { ...user, score: user.score },  // include score in the response
          dueCards
        });
      }
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({
        error: 'An error occurred while trying to log in.',
      });
    }
  };
  