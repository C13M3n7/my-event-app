const BILLPLZ_API_URL = 'https://www.billplz-sandbox.com/api/v3/bills';
const BILLPLZ_API_KEY = 'c2647f9f-71d1-4028-a364-8061893e38fd';
const BILLPLZ_COLLECTION_ID = 'djee3vqf';

/**
 * @typedef {Object} PaymentData
 * @property {string} email - The email of the payer.
 * @property {string} name - The name of the payer.
 * @property {number} amount - The amount to be paid in dollars.
 * @property {string} callback_url - The callback URL for payment status.
 * @property {string} description - The description of the payment.
 */

/**
 * @param {PaymentData} paymentData - The payment data object.
 */
export async function createBill(paymentData) {
  const formData = new FormData();
  formData.append('collection_id', BILLPLZ_COLLECTION_ID);
  formData.append('email', paymentData.email);
  formData.append('name', paymentData.name);
  formData.append('amount', (paymentData.amount * 100).toString()); // Convert to cents
  formData.append('callback_url', paymentData.callback_url);
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