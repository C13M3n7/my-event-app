const BILLPLZ_API_URL = 'https://www.billplz-sandbox.com/api/v3/bills';
const BILLPLZ_API_KEY = 'c2647f9f-71d1-4028-a364-8061893e38fd';
const BILLPLZ_COLLECTION_ID = 'djee3vqf';
const BILLPLZ_X_SIGNATURE_KEY = 'ed9fd28a360bd278f4cf912d973b6ecc6534861924dc6ca3ba4920ddddf2a0b3581223b883b33dfa5777d83d83762cf7b70ecd0f2f110d6447f862ed5fea73ed'; // Get this from Billplz dashboard

/**
 * Create Billplz bill with both callback and redirect URLs
 */
export async function createBill(paymentData) {
  const formData = new FormData();
  formData.append('collection_id', BILLPLZ_COLLECTION_ID);
  formData.append('email', paymentData.email);
  formData.append('name', paymentData.name);
  formData.append('amount', (paymentData.amount * 100).toString());
  formData.append('callback_url', paymentData.callback_url);
  formData.append('redirect_url', paymentData.redirect_url); // Add redirect URL
  formData.append('description', paymentData.description);

  const response = await fetch(BILLPLZ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(BILLPLZ_API_KEY + ':')}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to create Billplz bill');
  }

  return await response.json();
}

/**
 * Verify X-Signature for callback
 */
export function verifySignature(data, signature) {
  const crypto = require('crypto');
  const keys = Object.keys(data)
    .filter(key => key !== 'x_signature')
    .sort();
  
  const message = keys.map(key => `${key}${data[key]}`).join('|');
  const computedSignature = crypto
    .createHmac('sha256', BILLPLZ_X_SIGNATURE_KEY)
    .update(message)
    .digest('hex');
    
  return computedSignature === signature;
}