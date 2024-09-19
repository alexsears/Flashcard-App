const admin = require('firebase-admin');

exports.authenticateManager = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    const userDoc = await admin.firestore().collection('Users').doc(uid).get();
    const userData = userDoc.data();

    if (userData && userData.role === 'manager') {
      req.user = { ...userData, uid };
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Manager role required.' });
    }
  } catch (error) {
    console.error('Error authenticating manager:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

