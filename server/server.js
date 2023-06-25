require('dotenv').config();
const dbUser = encodeURIComponent(process.env.DB_USERNAME);
const dbPassword = encodeURIComponent(process.env.DB_PASSWORD);
const dbUri = `mongodb+srv://${dbUser}:${dbPassword}@peelek.mrnr4cd.mongodb.net/flashcard_app?retryWrites=true&w=majority`;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// import your routes
const signupRoutes = require('./routes/signupRoutes');
const flashcardsRoutes = require('./routes/flashcardsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const server = express();
server.use(cors()); 
server.use(express.json());

mongoose.connect(dbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Successfully connected to the database');
})
.catch(error => {
  console.log('Could not connect to the database. Exiting now...', error);
  process.exit();
});

// Use your routes
server.use('/signup', signupRoutes);
server.use('/flashcards', flashcardsRoutes);
server.use('/review', reviewRoutes);

const port = 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));
