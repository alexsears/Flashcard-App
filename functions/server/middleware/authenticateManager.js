const admin = require('firebase-admin');
const db = admin.firestore();



async function authenticateManager(req, res, next) {
  try {
    // Ensure req.user is populated (assumes previous middleware set it)
    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const userId = req.user.uid;

    // Fetch the user's role from the database
    const userSnap = await db.collection('Users').doc(userId).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnap.data();
    const userRole = userData.role;

    // Check if the user is a manager
    if (userRole !== 'manager') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // If the user is a manager, allow the request to continue
    next();

  } catch (error) {
    console.error('Error in authenticateManager middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  authenticateManager
};
