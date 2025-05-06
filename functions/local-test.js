// functions/local-test.js
const { sendEmail } = require('./utils/sendgrid');
const sendgridKey = 'your-test-key'; // Use a test key here

require('./index'); // This initializes your function

// Test email
sendEmail({
  to: 'recipient@example.com',
  from: 'teoje888@gmail.com',
  subject: 'Test Email',
  html: '<p>This is a test email</p>'
})
.then(() => console.log('Email sent successfully'))
.catch(err => console.error('Error sending email:', err));