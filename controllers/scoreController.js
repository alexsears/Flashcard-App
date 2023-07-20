const admin = require('firebase-admin');
const db = admin.firestore();

exports.getScore = async (req, res) => {
  try {
    const { uid } = req.query;
    console.log('getscore uid:', uid);
    // Get the Users collection
    const userCollection = db.collection('Users');
  
    // Get the document for the user
    const userDoc = userCollection.doc(uid);
  
    // Get the data for the document
    const userSnap = await userDoc.get();
    const user = userSnap.data();
  
    if (!user) {
      return res.status(404).json({
        error: `User with ID ${uid} not found.`,
      });
    }
  
    res.json({
      score: user.score,
    });
  } catch (error) {
    console.error('Error in getScore:', error);
    res.status(500).json({
      error: 'An error occurred while trying to get the score.',
    });
  }
};

exports.postScore = async (req, res) => {
  try {
    const { uid } = req.body;
    console.log('postscore uid:', uid);
    // Get the Users collection
    const userCollection = db.collection('Users');
  
    // Get the document for the user
    const userDoc = userCollection.doc(uid);
  
    // Get the data for the document
    const userSnap = await userDoc.get();
    const user = userSnap.data();
  
    if (!user) {
      return res.status(404).json({
        error: `User with ID ${uid} not found.`,
      });
    }

    console.log(`Current score for user ${uid}:`, user.score);
  
    await userDoc.update({
      score: admin.firestore.FieldValue.increment(1)
    });

    // Fetch the updated document and log the new score
    const updatedUserSnap = await userDoc.get();
    const updatedUser = updatedUserSnap.data();
    console.log(`Updated score for user ${uid}:`, updatedUser.score);
  
    res.json({
      message: `Score for user with ID ${uid} updated successfully.`,
      updatedScore: updatedUser.score
    });
  } catch (error) {
    console.error('Error in postScore:', error);
    res.status(500).json({
      error: 'An error occurred while trying to update the score.',
    });
  }
};
