const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

/**
 * Verify Admin Status (internal helper, not exported)
 */
const verifyAdmin = (context) => {
  if (!context?.auth) {
    console.error('No authentication context');
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const isAdmin = context.auth.token.admin || 
                 context.auth.token.superAdmin || 
                 context.auth.token.level === 'super-admin';

  if (!isAdmin) {
    console.error('Admin verification failed for:', context.auth.uid);
    throw new HttpsError('permission-denied', 'Admin access required');
  }
};

/**
 * Create Admin User
 */
exports.createAdminUser = onCall({
  region: 'us-central1',
  cors: true,
  enforceAppCheck: false, 
  allowUnauthenticated: false,
}, async (request) => {
  try {
    verifyAdmin(request);

    const { email } = request.data;
    if (!email) {
      throw new HttpsError('invalid-argument', 'Email is required');
    }

    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        user = await admin.auth().createUser({ email });
      } else {
        throw error;
      }
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, { 
      ...user.customClaims,
      admin: true,
      superAdmin: true,
      level: 'super-admin'
    });
    
    // Update Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      email,
      admin: true,
      superAdmin: true,
      role: 'super-admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return { 
      success: true,
      message: `Created admin user ${email}`,
      uid: user.uid
    };
  } catch (error) {
    console.error('Create admin error:', error);
    throw new HttpsError('internal', 'Failed to create admin user');
  }
});

/**
 * Manage Admin Roles (Promote/Demote)
 */
exports.manageAdminRole = onCall({
  region: 'us-central1',
  cors: true,
  enforceAppCheck: false, 
  allowUnauthenticated: false,
}, async (request) => {
  try {
    verifyAdmin(request);

    const { targetEmail, targetUid, action } = request.data;
    
    // Input validation
    if (!targetEmail && !targetUid) {
      throw new HttpsError('invalid-argument', 'Target identifier required');
    }

    if (!['promote', 'demote'].includes(action)) {
      throw new HttpsError('invalid-argument', 'Invalid action specified');
    }

    // Get target user
    const targetUser = targetEmail 
      ? await admin.auth().getUserByEmail(targetEmail)
      : await admin.auth().getUser(targetUid);

    // Prevent self-modification
    if (targetUser.uid === request.auth.uid) {
      throw new HttpsError('failed-precondition', 'Cannot modify your own role');
    }

    // Prepare new claims
    const newClaims = {
      ...(targetUser.customClaims || {}),
      admin: action === 'promote',
      superAdmin: action === 'promote',
      level: action === 'promote' ? 'super-admin' : undefined,
      updatedAt: Date.now()
    };

    // Atomic updates
    const batch = admin.firestore().batch();
    const userRef = admin.firestore().collection('users').doc(targetUser.uid);
    
    // Update Auth claims
    await admin.auth().setCustomUserClaims(targetUser.uid, newClaims);
    
    // Update Firestore
    batch.set(userRef, {
      email: targetUser.email,
      admin: newClaims.admin,
      superAdmin: newClaims.superAdmin,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    await batch.commit();

    return { 
      success: true,
      message: `Successfully ${action}d ${targetUser.email}`,
      user: {
        uid: targetUser.uid,
        email: targetUser.email,
        newRole: action === 'promote' ? 'Super Admin' : 'Non Admin'
      }
    };

  } catch (error) {
    console.error('Role management error:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });

    if (error.code === 'auth/user-not-found') {
      throw new HttpsError('not-found', 'User not found');
    }
    
    throw new HttpsError('internal', 'Role update failed');
  }
});

/**
 * List Users
 */
exports.listUsers = onCall({
  region: 'us-central1',
  cors: true,
  enforceAppCheck: false, 
  allowUnauthenticated: false,
}, async (request) => {
  try {
    verifyAdmin(request);
    
    const list = await admin.auth().listUsers(1000); // Max 1000 users
    return {
      users: list.users.map(user => ({
        uid: user.uid,
        email: user.email,
        isAdmin: user.customClaims?.admin || false,
        role: user.customClaims?.role || 'user'
      }))
    };
  } catch (error) {
    console.error('User listing error:', error);
    throw new HttpsError('internal', 'Failed to list users');
  }
});