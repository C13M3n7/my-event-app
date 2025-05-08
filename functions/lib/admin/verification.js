// functions/lib/admin/verification.js
const admin = require('firebase-admin');

module.exports = async ({ context }) => {
  try {
    // 1. Check token claims first (fastest)
    if (context?.auth?.token?.admin) {
      return { isAdmin: true };
    }

    // 2. Fallback to Firestore check if needed
    if (!context.auth) {
      return { isAdmin: false };
    }

    const userDoc = await admin.firestore()
      .doc(`users/${context.auth.uid}`)
      .get();

    return { 
      isAdmin: userDoc.exists && userDoc.data().role === 'admin' 
    };
  } catch (error) {
    console.error('Admin verification error:', error);
    return { isAdmin: false };
  }
};