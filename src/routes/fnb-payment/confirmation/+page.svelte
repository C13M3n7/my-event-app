<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { doc, getDoc, db } from '$lib/firebase';
	import { onMount } from 'svelte';
    
    // Payment status tracking
    let paymentStatus: 'processing' | 'pending' | 'paid' | 'failed' = 'processing';
    let paymentId = $page.url.searchParams.get('payment_id') || '';
    let billplzId = $page.url.searchParams.get('billplz[id]') || '';
    let isPaidParam = $page.url.searchParams.get('billplz[paid]') === 'true';
    let error: string | null = null;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000;
    
    // Order details
    let orderItems: {name: string, quantity: number, price: string}[] = [];
    let totalAmount = 'RM 0';
    let vendorName = '';
    
    // Rating system
    let rating = 0;
    let hoverRating = 0;
    let feedback = '';
  
    async function checkPaymentStatus() {
      try {
        if (isPaidParam && billplzId) {
          paymentStatus = 'paid';
          await fetchOrderDetails();
          return;
        }
  
        if (!paymentId) {
          throw new Error('Missing payment reference');
        }
  
        const docRef = doc(db, 'fnbpayment', paymentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          throw new Error('Payment record not found');
        }
        
        const data = docSnap.data();
        
        if (data.status === 'paid') {
          paymentStatus = 'paid';
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
        
        const docRef = doc(db, 'fnbpayment', paymentId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          vendorName = data.vendor || 'Vendor';
          orderItems = data.items || [];
          
          // Calculate total amount
          if (orderItems.length > 0) {
            const total = orderItems.reduce((sum, item) => {
              const price = parseFloat(item.price.toString().replace('RM ', '')) || 0;
              return sum + (price * item.quantity);
            }, 0);
            totalAmount = `RM ${total.toFixed(2)}`;
          }
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      }
    }
  
    function setRating(value: number) {
      rating = value;
    }
    
    function submitFeedback() {
      console.log('Submitted:', { rating, feedback });
      alert('Thank you for your feedback!');
      goto('/fnb-menu');
    }
    
    onMount(() => {
      checkPaymentStatus();
    });
  </script>
  
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header with conditional back button -->
    <header class="bg-white shadow-sm p-4 border-b">
      {#if paymentStatus === 'paid'}
        <button on:click={() => goto('/fnb-menu')} class="flex items-center gap-2 text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Back to Menu
        </button>
      {:else}
        <div class="h-5"></div> <!-- Spacer -->
      {/if}
    </header>
  
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
            on:click={() => goto('/fnb-menu')}
            class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Menu
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
        <!-- Success State with Rating Form -->
        <div class="bg-white rounded-xl shadow-md p-6 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
  
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Thank you for your order!</h1>
          <p class="text-gray-600 mb-6">A receipt has been sent to your email</p>
  
          <!-- Order Summary -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h2 class="font-medium text-center mb-3">Order Summary</h2>
            {#each orderItems as item}
              <div class="flex justify-between py-1">
                <span>{item.name} × {item.quantity}</span>
                <span>RM {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            {/each}
            <div class="border-t border-gray-200 mt-2 pt-2 font-medium flex justify-between">
              <span>Total</span>
              <span>{totalAmount}</span>
            </div>
          </div>
  
          <!-- Rating Section -->
          <div class="border-t border-gray-200 my-6"></div>
          <h2 class="text-lg font-medium text-gray-800 mb-3">How was your experience?</h2>
          
          <div class="flex justify-center gap-1 mb-4">
            {#each [1, 2, 3, 4, 5] as star}
              <button 
                class="text-2xl focus:outline-none transition-transform hover:scale-125"
                on:click={() => setRating(star)}
                on:mouseenter={() => hoverRating = star}
                on:mouseleave={() => hoverRating = 0}
              >
                <span class={
                  star <= (hoverRating || rating) 
                    ? "text-yellow-400" 
                    : "text-gray-300"
                }>
                  ★
                </span>
              </button>
            {/each}
          </div>
          <p class="text-sm text-gray-500 mb-6">
            {rating > 0 ? `You rated ${vendorName} ${rating} star${rating > 1 ? 's' : ''}` : 'Tap to rate'}
          </p>
  
          <!-- Feedback Section -->
          <div class="mb-6">
            <textarea 
              bind:value={feedback}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              rows="3" 
              placeholder="Any feedback for us? (Optional)"></textarea>
          </div>
  
          <!-- Submit Button -->
          <button 
            on:click={submitFeedback}
            class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={rating === 0}
          >
            {rating > 0 ? 'Submit Feedback' : 'Please rate first'}
          </button>
        </div>
      {/if}
    </main>
  </div>