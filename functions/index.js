const sgMail = require('@sendgrid/mail');
const { onRequest } = require('firebase-functions/v2/https');
const cors = require('cors');
const functions = require('firebase-functions');

const corsHandler = cors({ origin: true });

exports.sendEmail = onRequest(
  { secrets: ["API_KEY"] },
  async (req, res) => {
    // Apply CORS middleware
    corsHandler(req, res, async () => {
      try {
        const sendGridApiKey = process.env.API_KEY; 
        sgMail.setApiKey(sendGridApiKey);

        const { to, from, subject, html } = req.body;

        // Add OTP expiration in UTC
        const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // Expiry 5 minutes from now in UTC

        await sgMail.send({ to, from, subject, html });

        // Send a successful response
        res.status(200).json({ success: true, expirationTime }); // Include expiration time in the response
      } catch (error) {
        console.error('SendGrid error:', error);
        res.status(500).json({
          error: 'Failed to send email',
          details: error.message || 'Unknown error',
        });
      }
    });
  }
);

// Complete Email Sign-In Function - Firebase Callable
exports.completeEmailSignIn = functions.https.onCall(async (data, context) => {
  try {
    const { email } = data;

    if (!email) {
      throw new Error('Email is required');
    }

    // Use the imported `completeEmailSignIn` function from auth.js
    return await completeEmailSignIn(email);
  } catch (error) {
    console.error("Error completing email sign-in:", error);
    throw new functions.https.HttpsError('internal', 'Failed to complete email sign-in', error);
  }
});