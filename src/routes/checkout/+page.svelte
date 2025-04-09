<script lang="ts">
  import { cart } from '$lib/store';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let selectedMethod: string = '';
  let isPaying = false;

  const subtotal = $cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const points = 1.10;
  const total = Math.max(0, subtotal - points);

  async function handlePayment() {
    if (!selectedMethod) {
      alert('Please select a payment method.');
      return;
    }

    isPaying = true;
    await new Promise((r) => setTimeout(r, 1500)); // Simulate loading
    
    // Redirect to payment confirmation instead of showing alert
    cart.set([]);
    goto('/payment-confirmation');
  }

  function handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '/fallback.png';
  }
</script>

<!-- Rest of your checkout page template remains the same -->
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
          on:click={() => selectedMethod = method}
        >
          <span>{method}</span>
          <span>{selectedMethod === method ? '✓' : '→'}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- PAY NOW BUTTON -->
  <button 
    class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
    on:click={handlePayment}
    disabled={isPaying}
  >
    {isPaying ? 'Processing...' : 'Pay Now'}
  </button>
</div>