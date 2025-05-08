// functions/utils/error-handler.js
const { HttpsError } = require('firebase-functions/v2/https');

module.exports = {
  handleAuthError: (error) => {
    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found');
    }
    if (error.code === 'auth/email-already-exists') {
      throw new HttpsError('already-exists', 'Email already in use');
    }
    console.error('Auth error:', error);
    throw new HttpsError('internal', 'Authentication error');
  },
  
  handleFirestoreError: (error) => {
    console.error('Firestore error:', error);
    throw new HttpsError('internal', 'Database error');
  },
  
  handleSendGridError: (error) => {
    const message = error?.response?.body?.errors?.[0]?.message || 
                   error?.message || 
                   'Email service error';
    console.error('SendGrid error:', error);
    throw new HttpsError('internal', message);
  }
};