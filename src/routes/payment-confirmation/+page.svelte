<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { doc, getDoc, db } from '$lib/firebase.js';
  
  let paymentStatus: 'processing' | 'pending' | 'paid' | 'failed' = 'processing';
  let paymentId = $page.url.searchParams.get('payment_id') || '';
  let billplzId = $page.url.searchParams.get('billplz[id]') || '';
  let isPaidParam = $page.url.searchParams.get('billplz[paid]') === 'true';
  let qrCodeUrl = '';
  let error: string | null = null;
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds
  
  // Order details from Firestore
  let eventName = '';
  let ticketCategory = '';
  let ticketCount = 0;
  let totalPrice = 'RM 0';
  let ticketDetails: any[] = [];
  
  async function checkPaymentStatus() {
    try {
      if (isPaidParam && billplzId) {
        paymentStatus = 'paid';
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${billplzId}`;
        await fetchOrderDetails();
        return;
      }

      if (!paymentId) {
        throw new Error('Missing payment reference');
      }

      const docRef = doc(db, 'payments', paymentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Payment record not found');
      }
      
      const data = docSnap.data();
      
      if (data.status === 'paid') {
        paymentStatus = 'paid';
        qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data.billplzId || paymentId}`;
        await fetchOrderDetails();
      } 
      else if (data.status === 'pending') {
        paymentStatus = 'pending';
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkPaymentStatus, retryDelay);
        } else {
          paymentStatus = 'failed';
          error = 'Payment verification timeout';
        }
      }
      else {
        paymentStatus = 'failed';
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      error = err instanceof Error ? err.message : 'Payment verification failed';
      paymentStatus = 'failed';
    }
  }
  
  async function fetchOrderDetails() {
    try {
      if (!paymentId) return;
      
      const docRef = doc(db, 'payments', paymentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        eventName = data.event || 'Unknown Event';
        ticketDetails = data.ticketDetails || [];
        
        // Calculate totals from ticket details
        if (ticketDetails.length > 0) {
          ticketCategory = ticketDetails[0].name; // Assuming single category for simplicity
          ticketCount = ticketDetails.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = ticketDetails.reduce((sum, item) => {
            const price = parseFloat(item.price.replace('RM ', '')) || 0;
            return sum + (price * item.quantity);
          }, 0);
          totalPrice = `RM ${totalAmount.toFixed(2)}`;
        }
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  }
  
  function downloadTicket() {
    alert('PDF download would be implemented in production');
  }
  
  onMount(() => {
    checkPaymentStatus();
  });
</script>

<div class="payment-confirmation">
  {#if error}
    <div class="error-message">
      <h1>Payment Failed</h1>
      <p>{error}</p>
      <button class="action-button" on:click={() => window.location.href = '/payment'}>Try Again</button>
    </div>
  
  {:else if paymentStatus === 'processing' || paymentStatus === 'pending'}
    <div class="loading">
      <div class="spinner"></div>
      <p>
        {paymentStatus === 'processing' 
          ? 'Processing your payment...' 
          : `Waiting for payment confirmation... (Attempt ${retryCount}/${maxRetries})`}
      </p>
    </div>
  
  {:else if paymentStatus === 'paid'}
    <div class="success-container">
      <h1>Payment Successful!</h1>
      
      <p class="success-message">
        Thank you for your purchase! Your payment has been successfully processed. 
        A confirmation email with your E-ticket and QR code has been sent to your email. 
        You can also download your ticket as a PDF below.
      </p>
      
      <div class="order-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span class="summary-label">Event:</span>
          <span class="summary-value">{eventName}</span>
        </div>
        
        {#each ticketDetails as detail}
          {#if detail.quantity > 0}
            <div class="summary-row">
              <span class="summary-label">{detail.name}:</span>
              <span class="summary-value">{detail.quantity} ticket{#if detail.quantity > 1}s{/if}</span>
            </div>
          {/if}
        {/each}
        
        <div class="summary-row total-row">
          <span class="summary-label">Total Price:</span>
          <span class="summary-value">{totalPrice}</span>
        </div>
      </div>
      
      {#if qrCodeUrl}
        <div class="qr-code-container">
          <img src={qrCodeUrl} alt="Payment QR Code" class="qr-code" />
        </div>
      {/if}
      
      <div class="action-buttons">
        <button class="download-button" on:click={downloadTicket}>
          Download E-Ticket (PDF)
        </button>
        <button class="home-button" on:click={() => window.location.href = '/'}>
          Return To Home
        </button>
      </div>
    </div>
  
  {:else}
    <div class="error-message">
      <h1>Payment Failed</h1>
      <p>Sorry, we couldn't process your payment. Please try again.</p>
      <button class="action-button" on:click={() => window.location.href = '/payment'}>Try Again</button>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f5f5f5;
  }
  
  .payment-confirmation {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    min-height: 100vh;
    box-sizing: border-box;
  }
  
  h1 {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin: 20px 0;
    color: #4CAF50;
  }
  
  .success-message {
    color: #666;
    line-height: 1.5;
    margin-bottom: 24px;
    text-align: center;
  }
  
  .order-summary {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
  }
  
  h2 {
    font-size: 18px;
    margin-top: 0;
    margin-bottom: 16px;
    text-align: center;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .total-row {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid #ddd;
    font-weight: bold;
  }
  
  .summary-label {
    color: #666;
  }
  
  .summary-value {
    font-weight: 500;
  }
  
  .qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 24px 0;
  }
  
  .qr-code {
    width: 150px;
    height: 150px;
    border: 1px solid #eee;
    padding: 8px;
    background: white;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }
  
  button {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .download-button {
    background-color: #4353e8;
    color: white;
  }
  
  .download-button:hover {
    background-color: #3a46c9;
  }
  
  .home-button, .action-button {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
  }
  
  .home-button:hover, .action-button:hover {
    background-color: #e9e9e9;
  }
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #4353e8;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }
  
  .error-message {
    text-align: center;
    padding: 40px 20px;
  }
  
  .error-message h1 {
    color: #f44336;
  }
  
  .error-message p {
    margin-bottom: 24px;
    color: #666;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>