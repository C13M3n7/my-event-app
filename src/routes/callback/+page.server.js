import { db } from '$lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ url }) => {
  const paymentId = url.searchParams.get('payment_id');
  const billplzId = url.searchParams.get('billplz[id]');
  const paid = url.searchParams.get('billplz[paid]') === 'true';

  if (paymentId && billplzId) {
    try {
      // Update payment status in Firestore
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: paid ? 'paid' : 'failed',
        updatedAt: new Date().toISOString(),
        paidAt: paid ? new Date().toISOString() : null
      });

      return {
        status: paid ? 'success' : 'failed',
        paymentId
      };
    } catch (error) {
      console.error('Callback error:', error);
      return {
        status: 'error',
        message: 'Error processing payment status'
      };
    }
  }

  return {
    status: 'invalid',
    message: 'Missing payment parameters'
  };
};