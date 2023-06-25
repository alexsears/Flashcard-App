const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  cardid: Number,
  level: Number,
  levelcard: Number,
  audio: String,
  front: String,
  back: String,
}, { collection: 'flashcards' });

module.exports = mongoose.model('Card', cardSchema);
