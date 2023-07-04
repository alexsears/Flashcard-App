const mongoose = require('mongoose');
const Card = require('./Card');
const User = require('./User'); // Added this line. Don't forget to require User as well

const learningSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
  reviewCount: Number,
  easeFactor: Number,
  lastReviewDate: Date,
  nextReviewDate: Date,
}, { collection: 'LearningProgress' });


module.exports = mongoose.model('LearningProgress', learningSchema);
 