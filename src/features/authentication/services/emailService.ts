export class EmailService {
  static async sendOTP(params: { email: string; otp: string }) {
    const startTime = Date.now();
    try {
      const res = await fetch('https://us-central1-event-management-e606a.cloudfunctions.net/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: params.email,
          from: "teoje888@gmail.com",  // Ensure you have a valid 'from' email
          subject: 'Your Instant OTP Code',
          html: `
            <p>Your verification code is: <strong>${params.otp}</strong></p>
            <p><small>Generated at: ${new Date().toLocaleString()}</small></p>
          `
        })
      });

      const duration = Date.now() - startTime;
      console.log(`Email delivery took ${duration}ms`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Failed to send email: ${errorText}`);
        throw new Error(`HTTP error! status: ${res.status}, details: ${errorText}`);
      }

      return res.json();
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('Email delivery failed after', duration, 'ms');
      const message = error?.message || 'Unknown error during email delivery';
      console.error("Error:", message);

      // Throw a more detailed error with message and response
      throw new Error(message); 
    }
  }
}
