const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions/v2');

exports.verifyOtp = onCall({
  region: 'us-central1',
  cors: true,
  enforceAppCheck: false, 
  allowUnauthenticated: false, 
}, async (request) => {
  try {
    logger.log('Starting OTP verification', { 
      email: request.data?.email ? request.data.email.substring(0, 3) + '...' : 'none',
      purpose: request.data?.purpose || 'none'
    });

    // Validate request body
    if (!request.data) {
      throw new HttpsError('invalid-argument', 'No data provided');
    }

    const { email, otp, purpose } = request.data;

    if (!email || !otp || !purpose) {
      throw new HttpsError('invalid-argument', 'All fields are required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = admin.firestore();
    const auth = admin.auth();

    // 1. Lookup OTP
    const otpRef = db.doc(`emailOtps/${normalizedEmail}`);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      throw new HttpsError('not-found', 'OTP not found. Please request a new one.');
    }

    const otpData = otpDoc.data();

    // 2. Validate OTP
    if (otpData.otp !== otp) {
      await otpRef.update({
        attempts: admin.firestore.FieldValue.increment(1),
        lastAttempt: admin.firestore.FieldValue.serverTimestamp()
      });
      throw new HttpsError('permission-denied', 'Incorrect OTP code');
    }

    // 3. Check expiration
    if (new Date(otpData.expiresAt) < new Date()) {
      await otpRef.delete();
      throw new HttpsError('deadline-exceeded', 'OTP has expired');
    }

    // 4. Mark OTP as verified
    await otpRef.update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 5. Get or create user
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(normalizedEmail);
      
      if (!userRecord.emailVerified) {
        await auth.updateUser(userRecord.uid, { emailVerified: true });
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found' && purpose === 'REGISTRATION') {
        userRecord = await auth.createUser({
          email: normalizedEmail,
          emailVerified: true,
          disabled: false
        });

        await db.doc(`users/${userRecord.uid}`).set({
          email: normalizedEmail,
          admin: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          verified: true
        });
      } else {
        throw error;
      }
    }

    // 6. Verify user record exists
    if (!userRecord?.uid) {
      throw new HttpsError('internal', 'User record not available');
    }

    // 7. Get admin status
    const userDoc = await db.doc(`users/${userRecord.uid}`).get();
    const isAdmin = userDoc.exists ? userDoc.data().admin : false;

    // 8. Generate custom token with error handling
    try {
      logger.log('Generating token for:', userRecord.uid);
      const customToken = await auth.createCustomToken(userRecord.uid, {
        isAdmin,
        emailVerified: true
      });
      
      return {
        success: true,
        uid: userRecord.uid,
        customToken,
        isNewUser: purpose === 'REGISTRATION',
        isAdmin,
        email: normalizedEmail
      };
    } catch (tokenError) {
      logger.error('Token generation failed:', {
        error: tokenError,
        uid: userRecord.uid,
        serviceAccount: admin.app().options.credential?.projectId,
        initializedApps: admin.apps.length
      });
      throw new HttpsError('internal', 'Failed to generate authentication token');
    }

  } catch (error) {
    logger.error('OTP Verification Error:', {
      error: {
        code: error.code,
        message: error.message,
        stack: error.stack
      },
      request: {
        email: request.data?.email,
        purpose: request.data?.purpose
      },
      timestamp: new Date().toISOString()
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
      error.code || 'internal',
      error.message || 'OTP verification failed'
    );
  }
});