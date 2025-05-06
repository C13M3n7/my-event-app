// functions/auth.js (Cloud Function backend)
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.generateCustomToken = functions.https.onCall(async (data, context) => {
  const email = data.email;
  
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    // Create a custom token for the user
    const userRecord = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(userRecord.uid);

    // Optionally, send OTP to the email (or use another method)
    const otp = generateOTP();  // Replace with your OTP generation logic

    return { token, otp };
  } catch (error) {
    console.error('Error generating custom token:', error);
    throw new functions.https.HttpsError('internal', 'Error generating custom token');
  }
});

function generateOTP() {
  // Simple example: Generate a random 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}