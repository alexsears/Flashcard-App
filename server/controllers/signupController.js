// signupController.js

const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const Card = require('../models/Card');

exports.postSignup = async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Log the received request body
    const { uid } = req.body;

    let user = await User.findOne({ uid: uid });
    console.log('User lookup result:', user); // Log the result of the user lookup
    if (user) {
      console.log('User already exists. Updating dateUpdated field...'); // Log if the user already exists
      user.dateUpdated = new Date();
      await user.save();
      return res.status(200).json({ success: true });
    }

    console.log('User not found. Creating a new user...'); // Log if the user does not exist yet
    user = new User({ uid });
    await user.save();

    console.log('User created. Adding new learning progress...'); // Log after the user is created
    const newCards = await Card.find({}).sort({ _id: 1 }).limit(20);

    for (let card of newCards) {
      await new LearningProgress({
        userId: user._id,
        flashcardId: card._id,
        reviewCount: 0,
        easeFactor: 2.5, 
        lastReviewDate: null,
        nextReviewDate: new Date(),
      }).save();
    }

    console.log('Learning progress added. Signup process complete.'); // Log when the signup process is complete
    res.json({ success: true });
  } catch (error) {
    console.error('Error in signup:', error); // Log any errors that happen during the signup process
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
};
