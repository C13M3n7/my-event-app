const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

exports.createCustomToken = onCall({
  region: 'us-central1',
  cors: true,
  enforceAppCheck: false, 
  allowUnauthenticated: false, 
}, async (request) => {
  const { email } = request.data;  // Changed from direct destructuring
  
  if (!email) {
    throw new HttpsError('invalid-argument', 'Email is required');
  }

  try {
    // Get or create user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({ email });
      } else {
        throw error;
      }
    }

    // Check admin status
    const userDoc = await admin.firestore().doc(`users/${userRecord.uid}`).get();
    const isAdmin = userDoc.exists && userDoc.data().role === 'super-admin';

    const additionalClaims = {
      isAdmin: isAdmin,
      emailVerified: false
    };

    return {
      token: await admin.auth().createCustomToken(userRecord.uid, additionalClaims)
    };
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw new HttpsError('internal', 'Failed to create custom token');
  }
});