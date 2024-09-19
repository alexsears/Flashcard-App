require('dotenv').config();
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const express = require('express');
const cors = require('cors');
const allRoutes = require('./server/routes/allRoutes');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api', allRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});