<!-- src/routes/payment/+page.svelte -->
<script lang="ts">
    import { cart } from '$features/fnb/stores/cartStore';
    import PaymentMethodSelector from '$features/shared/components/PaymentMethodSelector.svelte';
    import { goto } from '$app/navigation';
    import type { PaymentMethod, PaymentContext } from '$shared/types/payment';
    import { processFnbPayment } from '$features/fnb/services/paymentService';
    import { page } from '$app/stores';
  
    // Get vendorId from URL params
    let vendorId: string | null = null;
    $: {
        if ($page.url.searchParams.has('vendorId')) {
            vendorId = $page.url.searchParams.get('vendorId');
        }
    }

    // Payment state
    let selectedMethod: PaymentMethod | null = null;
    let isProcessing = false;
    const context: PaymentContext = 'fnb';

    // Loyalty points system
    let availablePoints = 1250;
    const pointsConversionRate = 100; // 100 points = RM1
    let usePoints = false;

    // Declare all reactive variables
    let subtotal = 0;
    let serviceFee = 0;
    let grandTotalBeforeDiscount = 0;
    let maxRedeemablePoints = 0;
    let pointsDiscount = 0;
    let total = '0.00';

    let paymentError: string | null = null;
    let retryCount = 0;
    const maxRetries = 2;
    
    // Reactive calculations
    $: {
        // Get the current vendor's cart
        const currentCart = vendorId ? $cart[vendorId] : null;
        const items = currentCart?.items || [];
        
        subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        serviceFee = subtotal * 0.05;
        grandTotalBeforeDiscount = subtotal + serviceFee;
        maxRedeemablePoints = usePoints 
            ? Math.min(availablePoints, Math.floor(grandTotalBeforeDiscount * pointsConversionRate))
            : 0;
        pointsDiscount = usePoints ? (maxRedeemablePoints / pointsConversionRate) : 0;
        total = Math.max(0, (grandTotalBeforeDiscount - pointsDiscount)).toFixed(2);
    }

    async function handlePayment() {
        if (!selectedMethod) {
            alert('Please select a payment method');
            return;
        }
        
        if (isProcessing) return;
        
        isProcessing = true;
        
        try {
            const currentCart = vendorId ? $cart[vendorId] : null;
            const items = currentCart?.items || [];
            
            const result = await processFnbPayment(
                selectedMethod,
                items,
                usePoints ? maxRedeemablePoints : 0
            );

            if (result.success && result.orderId) {
                goto(`/profile/orders/fnb/${result.orderId}?paymentSuccess=true`);
            } else {
                alert(result.error || 'Payment failed. Please try again or use a different payment method.');
                console.error('Payment failed:', {
                    error: result.error,
                    method: selectedMethod,
                    amount: total
                });
            }
        } catch (error) {
            console.error('Unexpected payment error:', error);
            alert('An unexpected error occurred. Please try again later.');
        } finally {
            isProcessing = false;
        }
    }
</script>
  
<div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <button
            on:click={() => history.back()}
            class="text-gray-900"
            aria-label="Back"
        >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">Payment</h1>
        <div class="w-5"></div> <!-- Spacer for alignment -->
    </div>
  
    <!-- Scrollable Content -->
    <main class="flex-1 overflow-y-auto pb-24">
        <!-- Vendor Info -->
        {#if vendorId && $cart[vendorId]?.vendor}
            <div class="px-6 py-5 border-b border-gray-100">
                <div class="flex items-center space-x-4">
                    {#if $cart[vendorId].vendor.image}
                        <img
                            src={$cart[vendorId].vendor.image}
                            alt={$cart[vendorId].vendor.name}
                            class="h-12 w-12 rounded-full object-cover"
                        />
                    {:else}
                        <div class="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    {/if}
                    <div>
                        <h2 class="font-medium text-gray-900">{$cart[vendorId].vendor.name}</h2>
                        <p class="text-sm text-gray-500">{$cart[vendorId].items.length} items</p>
                    </div>
                </div>
            </div>
        {/if}
  
        <!-- Order Summary -->
        <div class="px-6 py-5">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Your Order</h2>
            
            <div class="space-y-4">
                {#if vendorId && $cart[vendorId]?.items}
                    {#each $cart[vendorId].items as item (item.id)}
                        <div class="flex justify-between items-start">
                            <div class="flex items-start space-x-4">
                                {#if item.image}
                                    <img src={item.image} alt={item.name} class="h-16 w-16 rounded-lg object-cover" />
                                {:else}
                                    <div class="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                {/if}
                                <div>
                                    <p class="font-medium text-gray-900">{item.name}</p>
                                    <p class="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    {#if item.note}
                                        <p class="text-xs text-gray-500 mt-1">Note: {item.note}</p>
                                    {/if}
                                </div>
                            </div>
                            <p class="font-medium text-gray-900">RM{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    {/each}
                {:else}
                    <div class="text-center py-8">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-gray-900">No items in cart</h3>
                        <p class="mt-1 text-sm text-gray-500">Please add items to your cart first</p>
                        <button
                            on:click={() => goto('/fnb-menu')}
                            class="mt-6 rounded-full bg-gray-900 px-6 py-3 text-white font-medium hover:bg-gray-800 active:bg-gray-700 transition-colors"
                        >
                            Browse Menu
                        </button>
                    </div>
                {/if}
            </div>
  
            <!-- Loyalty Points Section -->
            {#if availablePoints > 0 && vendorId && $cart[vendorId]?.items?.length > 0}
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-md font-medium text-gray-900">Loyalty Points</h3>
                        <span class="text-sm text-gray-500">
                            {availablePoints} pts (RM{(availablePoints / pointsConversionRate).toFixed(2)})
                        </span>
                    </div>
                    
                    <div class="bg-green-50 rounded-lg p-4">
                        <label class="flex items-center justify-between cursor-pointer">
                            <div class="flex items-center space-x-3">
                                <div class={`relative rounded-full w-10 h-5 transition-colors ${usePoints ? 'bg-green-600' : 'bg-gray-300'}`}>
                                    <input 
                                        type="checkbox" 
                                        bind:checked={usePoints}
                                        class="absolute opacity-0 w-0 h-0"
                                    >
                                    <span class={`absolute left-0 top-0 bottom-0 w-5 h-5 rounded-full shadow-md transform transition-transform ${usePoints ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'}`}></span>
                                </div>
                                <span class="font-medium text-gray-900">Use points</span>
                            </div>
                            {#if usePoints}
                                <span class="text-green-600 font-medium">
                                    -RM{(maxRedeemablePoints / pointsConversionRate).toFixed(2)}
                                </span>
                            {/if}
                        </label>
                        
                        {#if usePoints && maxRedeemablePoints > 0}
                            <p class="mt-2 text-sm text-green-800">
                                Using {maxRedeemablePoints} of {availablePoints} available points
                            </p>
                        {:else if usePoints}
                            <p class="mt-2 text-sm text-yellow-600">
                                Not enough points for this purchase
                            </p>
                        {/if}
                    </div>
                </div>
            {/if}
  
            <!-- Order Totals -->
            {#if vendorId && $cart[vendorId]?.items?.length > 0}
                <div class="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Subtotal</span>
                        <span class="text-gray-900">RM{subtotal.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Service Fee</span>
                        <span class="text-gray-900">RM{serviceFee.toFixed(2)}</span>
                    </div>
                    {#if usePoints}
                        <div class="flex justify-between text-green-600">
                            <span>Points Discount</span>
                            <span>-RM{pointsDiscount.toFixed(2)}</span>
                        </div>
                    {/if}
                    <div class="flex justify-between pt-3 border-t border-gray-200 mt-3 font-semibold">
                        <span class="text-gray-900">Total</span>
                        <span class="text-gray-900">RM{total}</span>
                    </div>
                </div>
            {/if}
        </div>
  
        <!-- Payment Method -->
        {#if vendorId && $cart[vendorId]?.items?.length > 0}
            <div class="px-6 py-5 border-t border-gray-200">
                <PaymentMethodSelector bind:selectedMethod {context} />
            </div>
        {/if}
    </main>
  
    <!-- Fixed Payment Button -->
    {#if vendorId && $cart[vendorId]?.items?.length > 0}
        <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 shadow-md">
            <button
                on:click={handlePayment}
                disabled={!selectedMethod || isProcessing}
                class="w-full bg-gray-900 text-white py-4 px-6 rounded-full font-medium
                    hover:bg-gray-700 active:bg-gray-800 transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {#if isProcessing}
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                {:else}
                    Pay RM{total}
                {/if}
                {#if paymentError}
                    <div class="mt-2 text-center text-red-600 text-sm">
                        {paymentError}
                        {#if retryCount > 0}
                            <br>Attempt {retryCount} of {maxRetries}...
                        {/if}
                    </div>
                {/if}
            </button>
            
            {#if isProcessing}
                <p class="mt-2 text-sm text-center text-gray-500">
                    Please wait while we process your payment
                </p>
            {/if}
        </div>
    {/if}
</div>