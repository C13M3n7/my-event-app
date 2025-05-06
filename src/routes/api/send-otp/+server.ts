// src/routes/api/send-otp/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
      const body = await request.json();
      
      // Verify required fields
      if (!body.email || !body.otp) {
        return json({ error: 'Missing email or OTP' }, { status: 400 });
      }

      const endpoint = import.meta.env.VITE_FIREBASE_FUNCTION_URL || 
                      'https://us-central1-event-management-e606a.cloudfunctions.net/sendEmail';
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: body.email,
          subject: 'Your OTP Code',
          html: `<p>Your OTP is: <strong>${body.otp}</strong></p>`,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error('Email service error:', error);
        return json({ error: error.message || 'Email service failed' }, { status: res.status });
      }
      
      return json(await res.json());
    } catch (error) {
      console.error('Internal server error:', error);
      return json({ error: 'Internal server error' }, { status: 500 });
    }
};