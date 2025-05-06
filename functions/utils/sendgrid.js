const sgMail = require('@sendgrid/mail');
const { onRequest } = require('firebase-functions/v2/https');

exports.sendEmail = onRequest(
  { secrets: ["API_KEY"] },
  async (req, res) => {
    try {
      const sendGridApiKey = process.env.API_KEY;
      sgMail.setApiKey(sendGridApiKey);

      if (req.method === 'OPTIONS') {
        return res.status(204).send('');
      }

      const { to, from = "teoje888@gmail.com", subject, html } = req.body;

      if (!to || !subject || !html) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await sgMail.send({ to, from, subject, html });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('SendGrid error:', error);

      // Robust error handling
      const message =
        error?.response?.body?.errors?.[0]?.message ||
        error?.message ||
        'Unknown SendGrid error';

      return res.status(500).json({
        error: 'Failed to send email',
        details: message,
      });
    }
  }
);