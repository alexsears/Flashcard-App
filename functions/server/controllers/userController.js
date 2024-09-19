const admin = require('firebase-admin');
const db = admin.firestore();

const fetchAndSortFlashcards = async (flashcardsCollection) => {
  const flashcardSnap = await flashcardsCollection.orderBy('cardid').get();
  if (flashcardSnap.empty) {
    console.error('No flashcards found!');
    throw new Error('No flashcards found to initialize learning progress.');
  }

  return flashcardSnap.docs
    .map(doc => ({...doc.data(), cardId: doc.id}))
    .sort((a, b) => Number(a.cardid) - Number(b.cardid));
};

const initializeLearningProgress = async (uid, flashcards, learningProgressCollection) => {
  console.log(`Setting up learning progress for user: ${uid}`);

  const progressPromises = flashcards.map(flashcard => {
    const id = `${uid}_${flashcard.cardId}`;
    return learningProgressCollection.doc(id).set({
      firebaseUid: uid,
      flashcardId: flashcard.cardId,
      nextReviewDate: admin.firestore.FieldValue.serverTimestamp(),
      interval: 1,
      reviewCount: 0,
      easeFactor: 2.5
    });
  });

  await Promise.all(progressPromises);
  console.log(`Learning progress initialized for user: ${uid}`);
};

const createUserDocument = async (uid, email, flashcards, userCollection) => {
  const newUser = { 
    firebaseUid: uid, 
    email: email,
    score: 0,
    dateCreated: admin.firestore.FieldValue.serverTimestamp(), 
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    progress: flashcards[Math.min(19, flashcards.length - 1)].cardid,
    role: 'user'
  };

  await userCollection.doc(uid).set(newUser);
  console.log(`User document created for UID: ${uid}`);
  
  return newUser;
};

const createUser = async (uid, email, userCollection, flashcardsCollection, learningProgressCollection) => {
  console.log(`Creating user with UID: ${uid}`);

  const flashcards = await fetchAndSortFlashcards(flashcardsCollection);
  await initializeLearningProgress(uid, flashcards, learningProgressCollection);
  return createUserDocument(uid, email, flashcards, userCollection);
};

const postSignup = async (req, res) => {
  try {
    const { uid, email } = req.body;
    console.log(`Received signup request for UID: ${uid} with email: ${email}`);

    const userCollection = db.collection('Users');
    const userDoc = userCollection.doc(uid);
    const userSnap = await userDoc.get();

    if (userSnap.exists) {
      console.log(`User with ID ${uid} already exists.`);
      return res.status(409).json({ error: `User with ID ${uid} already exists.` });
    }

    const flashcardsCollection = db.collection('Flashcards');
    const learningProgressCollection = db.collection('LearningProgress');
    
    const newUser = await createUser(uid, email, userCollection, flashcardsCollection, learningProgressCollection);

    console.log(`User with ID ${uid} signed up successfully.`);
    res.status(201).json({ message: `User with ID ${uid} signed up successfully.`, newUser });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'An error occurred while trying to sign up.', details: error.message });
  }
};

const postLogin = async (req, res) => {
  try {
    const { uid, email } = req.body;
    console.log(`Received login request for UID: ${uid}`);

    const userCollection = db.collection('Users');
    const userDoc = userCollection.doc(uid);
    let userSnap = await userDoc.get();
    let user = userSnap.data();

    const flashcardsCollection = db.collection('Flashcards');
    const learningProgressCollection = db.collection('LearningProgress');

    if (!user) {
      console.log(`User with ID ${uid} not found. Signing up...`);
      user = await createUser(uid, email, userCollection, flashcardsCollection, learningProgressCollection);
    } else {
      console.log(`User with ID ${uid} found. Updating last login...`);
      await userDoc.update({ lastLogin: admin.firestore.FieldValue.serverTimestamp() });
    }

    const learningProgressSnap = await learningProgressCollection.where('firebaseUid', '==', uid).get();
    const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

    console.log(`Learning progress fetched for user: ${uid}`);

    const dueCards = learningProgress.filter(lp => new Date(lp.nextReviewDate.toDate()) <= new Date());
    console.log(`Found ${dueCards.length} due flashcards for user: ${uid}`);

    res.json({
      message: `User with ID ${uid} logged in successfully.`,
      user: { 
        ...user, 
        score: user.score, 
        dueCards: dueCards.length 
      },
      dueCards
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      error: 'An error occurred while trying to log in.',
      details: error.message
    });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.userId;
  console.log('Fetching user data for userId:', userId);

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userDoc = await admin.firestore().collection('Users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'An error occurred while fetching user data', details: error.message });
  }
};

const getLearningProgress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const learningProgressCollection = db.collection('LearningProgress');
    const learningProgressSnap = await learningProgressCollection.where('firebaseUid', '==', userId).get();
    const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

    res.status(200).json(learningProgress);
  } catch (error) {
    console.error('Error in getLearningProgress:', error);
    res.status(500).json({
      error: 'An error occurred while trying to get learning progress.',
      details: error.message
    });
  }
};

const getLearningProgressStats = async (req, res) => {
  const { userId } = req.params;
  const learningProgressCollection = db.collection('LearningProgress');

  console.log(`Fetching learning progress stats for user ${userId}`);

  try {
    const learningProgressSnap = await learningProgressCollection.where('firebaseUid', '==', userId).get();
    const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

    console.log(`Fetched ${learningProgress.length} learning progress records for user ${userId}`);

    const stats = learningProgress.reduce((accum, curr) => {
      const date = curr.nextReviewDate.toDate().toISOString().split('T')[0];
      if (!accum[date]) accum[date] = 0;
      accum[date]++;
      return accum;
    }, {});

    console.log(`Calculated learning progress stats for user ${userId}:`, stats);

    res.json(stats);
  } catch (error) {
    console.error(`Error fetching learning progress stats for user ${userId}:`, error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new Error('Token is missing from request body');
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;
    
    // Use the existing postLogin logic
    const userCollection = db.collection('Users');
    const userDoc = userCollection.doc(uid);
    let userSnap = await userDoc.get();
    let user = userSnap.data();

    const flashcardsCollection = db.collection('Flashcards');
    const learningProgressCollection = db.collection('LearningProgress');

    if (!user) {
      console.log(`User with ID ${uid} not found. Signing up...`);
      user = await createUser(uid, email, userCollection, flashcardsCollection, learningProgressCollection);
    } else {
      console.log(`User with ID ${uid} found. Updating last login...`);
      await userDoc.update({ lastLogin: admin.firestore.FieldValue.serverTimestamp() });
    }

    const learningProgressSnap = await learningProgressCollection.where('firebaseUid', '==', uid).get();
    const learningProgress = learningProgressSnap.docs.map(doc => ({...doc.data(), id: doc.id}));

    console.log(`Learning progress fetched for user: ${uid}`);

    const dueCards = learningProgress.filter(lp => new Date(lp.nextReviewDate.toDate()) <= new Date());
    console.log(`Found ${dueCards.length} due flashcards for user: ${uid}`);

    res.json({
      message: `User with ID ${uid} logged in successfully.`,
      user: { 
        ...user, 
        score: user.score, 
        dueCards: dueCards.length 
      },
      dueCards
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Failed to sign up or log in on the server.', error: error.message });
  }
};

module.exports = {
  login,
  postSignup,
  postLogin,
  getUser,
  getLearningProgress,
  getLearningProgressStats
};