const admin = require('firebase-admin');

const db = admin.firestore();

  async function authenticateManager(req, res, next) {
  const userId = req.user.uid; // assuming req.user is set by a previous authentication middleware

  // Fetch the user's role from the database
  const userSnap = await db.collection('Users').doc(userId).get();
  const userData = userSnap.data();
  const userRole = userData.role;

  if (userRole !== 'manager') {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  // If the user is a manager, allow the request to continue
  next();
}

module.exports = {
  authenticateManager
};
