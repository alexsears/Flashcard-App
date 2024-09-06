const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'pootcuppeelek-316a576ed35c.json');
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pootcuppeelek.firebaseio.com'
  });
}

const db = admin.firestore();

exports.getUserStats = async (req, res) => {
  try {
    const usersSnap = await db.collection('Users').get();
    const totalUsers = usersSnap.size;

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersSnap = await db.collection('Users')
      .where('lastLogin', '>', admin.firestore.Timestamp.fromDate(oneWeekAgo))
      .get();
    const activeUsers = activeUsersSnap.size;

    const inactiveUsers = totalUsers - activeUsers;

    const emailAddresses = usersSnap.docs.map(doc => doc.data().email);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      emailAddresses,
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      error: 'An error occurred while trying to get user stats.',
    });
  }
};

exports.getUsageStats = async (req, res) => {
  try {
    const reviewLogsSnap = await db.collection('ReviewLogs').get();
    const totalReviews = reviewLogsSnap.size;

    const userStatsSnap = await db.collection('UserStats').get();
    const totalUsers = userStatsSnap.size;
    
    let totalCorrectReviews = 0;
    userStatsSnap.forEach(doc => {
      totalCorrectReviews += doc.data().correctReviews || 0;
    });

    const avgReviewsPerUser = totalReviews / totalUsers;
    const overallAccuracy = totalCorrectReviews / totalReviews;

    res.json({
      totalReviews,
      avgReviewsPerUser,
      overallAccuracy,
    });
  } catch (error) {
    console.error('Error in getUsageStats:', error);
    res.status(500).json({
      error: 'An error occurred while trying to get usage stats.',
    });
  }
};

exports.getFlashcardStats = async (req, res) => {
  try {
    const flashcardsSnap = await db.collection('Flashcards').get();
    const totalFlashcards = flashcardsSnap.size;

    const reviewLogsSnap = await db.collection('ReviewLogs').get();
    
    const flashcardStats = {};
    reviewLogsSnap.forEach(doc => {
      const data = doc.data();
      if (!flashcardStats[data.flashcardId]) {
        flashcardStats[data.flashcardId] = { totalReviews: 0, correctReviews: 0 };
      }
      flashcardStats[data.flashcardId].totalReviews++;
      if (data.performanceRating === 'correct') {
        flashcardStats[data.flashcardId].correctReviews++;
      }
    });

    const flashcardDifficulties = Object.entries(flashcardStats).map(([id, stats]) => ({
      id,
      difficulty: 1 - (stats.correctReviews / stats.totalReviews)
    }));

    const mostDifficultFlashcards = flashcardDifficulties
      .sort((a, b) => b.difficulty - a.difficulty)
      .slice(0, 10);

    res.json({
      totalFlashcards,
      mostDifficultFlashcards,
    });
  } catch (error) {
    console.error('Error in getFlashcardStats:', error);
    res.status(500).json({
      error: 'An error occurred while trying to get flashcard stats.',
    });
  }
};

exports.getUserProgressOverTime = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reviewLogsSnap = await db.collection('ReviewLogs')
      .where('userId', '==', userId)
      .orderBy('reviewDate')
      .get();

    const progressOverTime = reviewLogsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.reviewDate.toDate(),
        performance: data.performanceRating === 'correct' ? 1 : 0,
        interval: data.newState.interval,
        easeFactor: data.newState.easeFactor
      };
    });

    res.json({
      userId,
      progressOverTime,
    });
  } catch (error) {
    console.error('Error in getUserProgressOverTime:', error);
    res.status(500).json({
      error: 'An error occurred while trying to get user progress over time.',
    });
  }
};

module.exports = exports;