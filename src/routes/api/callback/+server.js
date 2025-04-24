import { verifySignature } from '$lib/billplz';
import { db, updateDoc, doc } from '$lib/firebase';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const billData = Object.fromEntries(formData);
    
    // Verify the signature
    if (!verifySignature(billData, billData.x_signature)) {
      return new Response('Invalid signature', { status: 401 });
    }
    
    // Update payment in Firestore
    const paymentRef = doc(db, 'payments', billData.id);
    await updateDoc(paymentRef, {
      status: billData.paid ? 'paid' : 'failed',
      paidAt: billData.paid ? new Date().toISOString() : null,
      billplzData: billData
    });
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Callback error:', error);
    return new Response('Error processing callback', { status: 500 });
  }
}