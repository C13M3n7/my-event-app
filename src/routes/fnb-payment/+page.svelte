<script lang="ts">
    import { cart } from '$features/fnb/stores/cartStore';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { addDoc, collection, updateDoc, db } from '$lib/firebase';
  
    let selectedMethod: string = '';
    let isPaying = false;
    let showBillplzForm = false;
    
    // Billplz form variables
    let name = '';
    let email = '';
    let error = '';
    let isLoading = false;
  
    const subtotal = $cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const points = 1.10;
    const total = Math.max(0, subtotal - points);
  
    function selectPaymentMethod(method: string) {
      selectedMethod = method;
      showBillplzForm = method === 'BillPlz';
      
      // Add a small delay to ensure the form has rendered
      setTimeout(() => {
        const formElement = document.querySelector('.payment-form-container');
        if (formElement) {
          formElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 50);
    }
  
    async function handleBillplzPayment() {
      if (!name || !email) {
        error = 'Please fill in all fields';
        return;
      }
  
      isLoading = true;
      error = '';
  
      try {
        // Create payment record in Firestore first
        const paymentRef = await addDoc(collection(db, 'fnbpayment'), {
          name,
          email,
          amount: total,
          description: 'Payment for cart items',
          status: 'pending',
          createdAt: new Date().toISOString(),
          items: $cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        });
  
        // Call our SvelteKit endpoint to create Billplz bill
        const response = await fetch('/api/create-bill', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            amount: total,
            description: 'Payment for cart items',
            callback_url: `${window.location.origin}/callback?payment_id=${paymentRef.id}`,
            redirect_url: `${window.location.origin}/fnb-payment/confirmation?payment_id=${paymentRef.id}`
          })
        });
  
        if (!response.ok) {
          throw new Error('Failed to create bill');
        }
  
        const bill = await response.json();
  
        // Update Firestore with Billplz ID
        await updateDoc(paymentRef, {
          billplzId: bill.id,
          billplzUrl: bill.url
        });
  
        // Redirect to Billplz payment page
        window.location.href = bill.url;
      } catch (err) {
        error = err instanceof Error ? err.message : 'Payment failed. Please try again.';
        isLoading = false;
      }
    }
  
    async function handlePayment() {
      if (!selectedMethod) {
        alert('Please select a payment method.');
        return;
      }
  
      // If Billplz, we handle it separately
      if (selectedMethod === 'BillPlz') {
        return;
      }
  
      isPaying = true;
      await new Promise((r) => setTimeout(r, 1500)); // Simulate loading
      
      // Redirect to payment confirmation instead of showing alert
      cart.set([]);
      goto('/fnb-payment/confirmation_dummy', {
        state: {
          method: selectedMethod,
          total: total.toFixed(2),
          items: $cart
        }
      });
    }
  
    function handleImageError(event: Event) {
      const target = event.target as HTMLImageElement;
      target.src = '/fallback.png';
    }
  </script>
  
  <div class="p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Order Confirmation</h1>
  
    <!-- CART ITEMS -->
    <div class="space-y-3 mb-6">
      {#each $cart as item}
        <div class="bg-white shadow-md p-4 rounded-xl">
          <div class="flex items-start gap-4">
            <img 
                src={item.image ?? '/fallback.png'} 
                alt={item.name} 
                class="w-24 h-24 rounded-lg object-cover shadow-md transition-transform transform hover:-translate-y-1 hover:scale-105"
                on:error={handleImageError}
            />
  
            <div>
              <p class="font-medium">{item.name} × {item.quantity}</p>
              <p class="text-gray-600">RM {item.price.toFixed(2)} each</p>
              {#if item.note}
                <p class="text-sm text-gray-400 italic mt-1">Remarks: {item.note}</p>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  
    <!-- PRICE SUMMARY -->
    <div class="bg-gray-50 p-4 rounded-lg border mb-6">
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Subtotal:</span>
          <span>RM {subtotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between text-green-600">
          <span>Points Discount:</span>
          <span>- RM {points.toFixed(2)}</span>
        </div>
        <div class="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>RM {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  
    <!-- PAYMENT METHOD -->
    <div class="mb-8">
        <h2 class="font-semibold text-lg mb-3">Payment Method</h2>
        <div class="space-y-3">
          {#each ['BillPlz', 'Spay', 'Cash'] as method}
            <button
              type="button"
              class={`w-full p-3 rounded-lg flex items-center justify-between transition-colors border ${
                selectedMethod === method
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              on:click={() => selectPaymentMethod(method)}
            >
              <div class="flex items-center gap-3">
                {#if method === 'BillPlz'}
                  <img src="https://cdn-icons-png.flaticon.com/512/9063/9063313.png" alt="Billplz" class="w-6 h-6" />
                {:else if method === 'Spay'}
                  <img src="https://play-lh.googleusercontent.com/_N6rLvVI8wwp8kCGEaAQBJtFBOwA62JUSp5vDxwBUDq1J0XCi8W4Wit3ECwdrwn3fyrr" alt="Spay" class="w-6 h-6" />
                {:else}
                  <img src="https://cdn-icons-png.flaticon.com/512/2703/2703542.png" alt="Cash" class="w-6 h-6" />
                {/if}
                <span>{method}</span>
              </div>
              <span>{selectedMethod === method ? '✓' : '→'}</span>
            </button>
          {/each}
        </div>
        
        <!-- Return to Menu Button -->
        <button 
          class="w-full mt-4 p-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          on:click={() => goto('/cart')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Return to Cart
        </button>
      </div>
  
    <!-- BILLPLZ PAYMENT FORM -->
    {#if showBillplzForm}
      <div class="payment-form-container p-5 bg-gray-50 rounded-lg border border-gray-200 mb-5 animate-fade-in">
        {#if error}
          <div class="text-red-500 mb-4 p-2.5 bg-red-50 rounded border border-red-200">{error}</div>
        {/if}
        
        <h3 class="text-lg font-medium mb-4">Billplz Payment Details</h3>
        
        <div class="mb-4">
          <label for="name" class="block text-sm mb-1">Full Name</label>
          <input 
            type="text" 
            id="name" 
            bind:value={name} 
            required 
            class="w-full p-2.5 border border-gray-300 rounded" 
            placeholder="Your full name"
          />
        </div>
    
        <div class="mb-4">
          <label for="email" class="block text-sm mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            bind:value={email} 
            required 
            class="w-full p-2.5 border border-gray-300 rounded" 
            placeholder="Your email address"
          />
        </div>
    
        <div class="mb-4">
          <label class="block text-sm mb-1">Amount (MYR)</label>
          <input 
            type="text" 
            value={"RM " + total.toFixed(2)} 
            readonly 
            class="w-full p-2.5 border border-gray-300 rounded bg-gray-100" 
          />
        </div>
    
        <button 
          type="button" 
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          on:click={handleBillplzPayment}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Proceed to Billplz Payment'}
        </button>
      </div>
    {/if}
  
    <!-- PAY NOW BUTTON (for non-Billplz payments) -->
    {#if !showBillplzForm}
      <button 
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        on:click={handlePayment}
        disabled={isPaying}
      >
        {isPaying ? 'Processing...' : 'Pay Now'}
      </button>
    {/if}
  </div>
  
  <style>
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  </style>