const { MongoClient } = require('mongodb');
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  if (err) {
    console.error('Failed to connect:', err);
    return;
  }

  const flashcardsCollection = client.db("flashcard_app").collection("flashcards");
  const progressCollection = client.db("flashcard_app").collection("LearningProgress");

  flashcardsCollection.find({}).toArray((err, docs) => {
    if (err) {
      console.error('Failed to fetch flashcards:', err);
      return;
    }

    console.log('All flashcards:', docs);
  });

  progressCollection.find({}).toArray((err, docs) => {
    if (err) {
      console.error('Failed to fetch progress:', err);
      return;
    }

    console.log('All progress:', docs);
  });

  client.close();
});
