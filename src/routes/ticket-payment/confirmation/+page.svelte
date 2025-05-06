<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { doc, getDoc, db } from '$lib/firebase';
    import { goto } from '$app/navigation';
    
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
  
  <div class="min-h-screen bg-gray-50 flex flex-col">
  <!-- Header with back button -->
  
  <main class="flex-1 max-w-md mx-auto w-full p-6">
    {#if error || paymentStatus === 'failed'}
      <!-- Error State -->
      <div class="bg-white rounded-xl shadow-md p-6 text-center">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
        <p class="text-gray-600 mb-6">{error || 'Your payment could not be processed'}</p>
        
        <button 
          on:click={() => goto('/events')}
          class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
  
    {:else if paymentStatus === 'processing' || paymentStatus === 'pending'}
      <!-- Loading State -->
      <div class="bg-white rounded-xl shadow-md p-6 text-center">
        <div class="flex flex-col items-center justify-center h-48">
          <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>
            {paymentStatus === 'processing' 
              ? 'Processing your payment...' 
              : `Verifying payment... (Attempt ${retryCount}/${maxRetries})`}
          </p>
        </div>
      </div>
  
    {:else if paymentStatus === 'paid'}
      <!-- Success State -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
  
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p class="text-gray-600 mb-6">
            Thank you for your purchase! Your payment has been successfully processed. 
            A confirmation email has been sent to your email.
          </p>
        </div>
  
        <!-- Order Summary -->
        <div class="bg-gray-50 rounded-lg p-5 mb-6">
          <h2 class="text-lg font-medium mb-4 text-center">Order Summary</h2>
          
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">Event:</span>
            <span class="font-medium">{eventName}</span>
          </div>
          
          {#each ticketDetails as detail}
            {#if detail.quantity > 0}
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">{detail.name}:</span>
                <span class="font-medium">{detail.quantity} ticket{#if detail.quantity > 1}s{/if}</span>
              </div>
            {/if}
          {/each}
          
          <div class="flex justify-between mt-3 pt-3 border-t border-gray-300">
            <span class="text-gray-600 font-semibold">Total Price:</span>
            <span class="font-semibold">{totalPrice}</span>
          </div>
        </div>
        
        {#if qrCodeUrl}
          <div class="flex flex-col items-center my-6">
            <img src={qrCodeUrl} alt="Payment QR Code" class="w-40 h-40 border border-gray-200 p-2 bg-white" />
          </div>
        {/if}
        
        <div class="flex flex-col gap-3">
          <button 
            on:click={downloadTicket}
            class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Download E-Ticket (PDF)
          </button>
          <button 
            on:click={() => goto('/')}
            class="w-full py-2.5 text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    {/if}
  </main>
  </div>