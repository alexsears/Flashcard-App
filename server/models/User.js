const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  streak: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: {
    createdAt: 'dateCreated',
    updatedAt: 'dateUpdated'
  }
}, { collection: 'users' });

module.exports = mongoose.model('User', UserSchema);
