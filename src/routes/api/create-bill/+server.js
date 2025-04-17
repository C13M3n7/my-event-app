import { createBill } from '$lib/billplz';

export async function POST({ request }) {
  try {
    const paymentData = await request.json();
    const bill = await createBill(paymentData);
    
    return new Response(JSON.stringify(bill), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}