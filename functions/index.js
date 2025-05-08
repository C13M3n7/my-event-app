const admin = require('firebase-admin');
admin.initializeApp();

// Import your grouped logic
const otpFunctions = require('./lib/auth/otp');
const customTokenFunctions = require('./lib/auth/custom-token');
const adminFunctions = require('./lib/admin/roles');
const emailFunctions = require('./lib/email/sendgrid');

// Simply re-export the already-wrapped functions
exports.verifyOtp = otpFunctions.verifyOtp;
exports.createCustomToken = customTokenFunctions.createCustomToken;
exports.createAdminUser = adminFunctions.createAdminUser;
exports.manageAdminRole = adminFunctions.manageAdminRole;
exports.listUsers = adminFunctions.listUsers;
exports.sendEmail = emailFunctions.sendEmail;