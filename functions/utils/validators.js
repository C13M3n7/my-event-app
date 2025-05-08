// functions/utils/validators.js
const { HttpsError } = require('firebase-functions/v2/https');

module.exports = {
  validateEmail: (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpsError('invalid-argument', 'Invalid email address');
    }
  },
  
  validateAdminContext: (context) => {
    if (!context?.auth?.token?.admin) {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
  }
};