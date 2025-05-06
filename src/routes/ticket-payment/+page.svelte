<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { addDoc, collection, updateDoc, db } from '$lib/firebase';
  
    type Category = {
      id: number;
      name: string;
      price: string;
      quantity: number;
    };
  
    type Ticket = {
      id: string;
      event: string;
      date: string;
      category: string;
      quantity: number;
      price: number;
      status: string;
      reference: string;
      paymentMethod: string;
      barcode: string;
      qrCode: string;
    };
  
    // Get event details from URL
    let eventName = $page.url.searchParams.get('event') || "Sunset Music Festival";
    let eventType = $page.url.searchParams.get('type') || "festival";
    //let basePrice = parseInt($page.url.searchParams.get('price') || "80");
    let basePrice = 50;

    // Initialize categories based on event type
    let categories: Category[] = [
      { id: 1, name: "Early Bird", price: `RM ${basePrice}`, quantity: 0 },
      { id: 2, name: "Regular", price: `RM ${Math.round(basePrice * 1.25)}`, quantity: 0 },
      { id: 3, name: "VIP", price: `RM ${Math.round(basePrice * 1.875)}`, quantity: 0 }
    ];
    
    let totalPrice: number = 0;
    let showPaymentSection = false;
    let paymentSuccess = false;
    let selectedPaymentMethod = "";
    let showBillplzForm = false;
    let showSpayForm = false;
    let paymentReference = "";
    let processingPayment = false;
    
    // Billplz form variables
    let name = '';
    let email = '';
    let amount = '';
    let description = 'Payment for event tickets';
    let isLoading = false;
    let paymentUrl = '';
    let error = '';
    
    // Ticket history
    let showTicketHistory = false;
    let purchasedTickets: Ticket[] = [];
    let selectedTicket: Ticket | null = null;
  
    function initializeEventType() {
      switch (eventType) {
        case 'festival':
          categories = [
            { id: 1, name: "Early Bird", price: `RM ${Math.round(basePrice * 0.8)}`, quantity: 0 },
            { id: 2, name: "Regular", price: `RM ${basePrice}`, quantity: 0 },
            { id: 3, name: "VIP", price: `RM ${Math.round(basePrice * 1.5)}`, quantity: 0 }
          ];
          break;
        case 'free':
          categories = [
            { id: 1, name: "General Admission", price: "RM 0", quantity: 1 },
          ];
          break;
      }
      calculateTotal();
    }
  
    function calculateTotal() {
      totalPrice = categories.reduce((sum, cat) => {
        const priceValue = parseInt(cat.price.split(' ')[1]) || 0;
        return sum + (priceValue * cat.quantity);
      }, 0);
      amount = totalPrice.toString();
      description = `Payment for ${eventName} tickets`;
    }
  
    function handleQuantityChange(index: number, value: number) {
      if (value < 0) value = 0;
      if (eventType === 'free') {
        value = Math.min(value, 1);
      }
      categories[index].quantity = value;
      calculateTotal();
    }
  
    function proceedToPayment() {
      if (eventType === 'free') {
        paymentReference = `FREE-${Date.now().toString().slice(-8)}`;
        paymentSuccess = true;
        addTicketToHistory();
        return;
      }
      
      showPaymentSection = true;
      setTimeout(() => {
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  
    function selectPaymentMethod(method: string) {
        selectedPaymentMethod = method;
        showBillplzForm = method === 'Card';
        showSpayForm = method === 'Spay';
        
        // Add a small delay to ensure the form has rendered
        setTimeout(() => {
            const formElement = document.querySelector('.payment-form-container');
            if (formElement) {
                formElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 50); // 50ms delay
    }

  async function handleBillplzSubmit() {
    if (!name || !email || !amount) {
      error = 'Please fill in all fields';
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Create payment record in Firestore first
      const paymentRef = await addDoc(collection(db, 'payments'), {
        name,
        email,
        amount: parseFloat(amount),
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        event: eventName,
        ticketDetails: categories.filter(cat => cat.quantity > 0).map(cat => ({
          name: cat.name,
          quantity: cat.quantity,
          price: cat.price
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
            amount: parseFloat(amount),
            description,
            callback_url: `${window.location.origin}/callback?payment_id=${paymentRef.id}`,
            redirect_url: `${window.location.origin}/ticket-payment/confirmation?payment_id=${paymentRef.id}`
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

  function confirmPayment() {
    processingPayment = true;
    if (selectedPaymentMethod === "Spay") {
      paymentReference = `SPY-${Date.now().toString().slice(-8)}`;
      setTimeout(() => {
        paymentSuccess = true;
        processingPayment = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        addTicketToHistory();
      }, 1000);
    }
  }

  function addTicketToHistory() {
    const purchasedCategories = categories.filter(cat => cat.quantity > 0);
    
    purchasedCategories.forEach(cat => {
      const ticketId = `T-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      const ticketDate = new Date();
      ticketDate.setDate(ticketDate.getDate() + 30);
      
      const newTicket: Ticket = {
        id: ticketId,
        event: eventName,
        date: ticketDate.toLocaleDateString() + ', ' + 
              ticketDate.getHours().toString().padStart(2, '0') + ':' + 
              ticketDate.getMinutes().toString().padStart(2, '0'),
        category: cat.name,
        quantity: cat.quantity,
        price: parseInt(cat.price.split(' ')[1]) * cat.quantity,
        status: "Active",
        reference: paymentReference,
        paymentMethod: eventType === 'free' ? 'Free' : selectedPaymentMethod,
        barcode: Math.random().toString().slice(2, 20),
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EVENT:${eventName}|REF:${paymentReference}|QUANTITY:${cat.quantity}`
      };
      
      purchasedTickets = [newTicket, ...purchasedTickets];
    });
  }

  function returnToHome() {
    paymentSuccess = false;
    showPaymentSection = false;
    selectedPaymentMethod = "";
    showBillplzForm = false;
    showSpayForm = false;
    showTicketHistory = false;
    selectedTicket = null;
    initializeEventType();
  }

  function showTickets() {
    showTicketHistory = true;
    selectedTicket = null;
  }

  function viewTicketDetails(ticket: Ticket) {
    selectedTicket = ticket;
  }

  function backToTicketList() {
    selectedTicket = null;
  }

  function downloadTicket() {
    console.log('Downloading ticket with reference:', selectedTicket ? selectedTicket.reference : paymentReference);
    alert('Ticket download would be implemented in production');
  }

  function addToWallet() {
    alert('Add to wallet functionality would be implemented in production');
  }

  onMount(() => {
    initializeEventType();
    const urlParams = new URLSearchParams(window.location.search);
    const billplz_id = urlParams.get('billplz[id]');
    const billplz_paid = urlParams.get('billplz[paid]');
    
    if (billplz_id && billplz_paid === 'true') {
      // Payment was successful
      paymentSuccess = true;
      paymentReference = billplz_id;
      addTicketToHistory();
    } else if (billplz_id) {
      // Payment failed
      paymentSuccess = false;
      paymentReference = billplz_id;
    }
  });
</script>

<svelte:head>
    <title>Ticket Purchase - {eventName}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="max-w-md min-h-screen mx-auto bg-white shadow-md relative">
    <!-- Header Navigation -->
    <header class="flex justify-between items-center p-4 border-b border-gray-200">
        <a href="/events" class="text-blue-600 hover:underline">← Back</a>
        <h1 class="text-lg font-semibold">Purchase Tickets</h1>
        <a href="/profile/tickets" class="text-blue-600 hover:underline">My Tickets →</a>
    </header>

    <!-- Ticket Purchase Screen -->
    <main class="p-5 pb-10 relative">
        {#if processingPayment}
            <div class="fixed inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center z-50">
                <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Processing payment...</p>
            </div>
        {/if}
        
        <h2 class="text-xl font-semibold mb-4">{eventName}</h2>
        
        {#each categories as category, index}
            <div class="flex justify-between items-center p-4 border-b border-gray-100">
                <div>
                    <h3 class="font-medium">{category.name}</h3>
                    <span class="text-sm text-gray-600">{category.price}</span>
                </div>
                <div class="flex items-center">
                    <button
                        class="w-8 h-8 border border-gray-300 bg-white text-gray-700 disabled:text-gray-300"
                        on:click={() => handleQuantityChange(index, category.quantity - 1)}
                        disabled={category.quantity <= 0}>
                        −
                    </button>
                    <input
                        type="number"
                        bind:value={category.quantity}
                        readonly
                        class="w-10 text-center mx-1 border-none bg-transparent text-sm" />
                    <button
                        class="w-8 h-8 border border-gray-300 bg-white text-gray-700 disabled:text-gray-300"
                        on:click={() => handleQuantityChange(index, category.quantity + 1)}
                        disabled={eventType === 'free'}>
                        +
                    </button>
                </div>
            </div>
        {/each}
        
        <div class="flex justify-between px-4 py-4 font-semibold">
            <span>Total</span>
            <span>RM {totalPrice.toFixed(2)}</span>
        </div>
        
        <button 
            class="w-full py-3.5 rounded text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors" 
            on:click={proceedToPayment}
            disabled={totalPrice <= 0 && eventType !== 'free'}>
            {eventType === 'free' ? 'Get Free Ticket' : 'Proceed to Payment'}
        </button>

        {#if showPaymentSection && eventType !== 'free'}
                <div id="payment-section" class="mt-8 pt-5 border-t border-gray-200">
                    <h2 class="text-lg font-medium mb-3">Order Summary</h2>
                    <p class="mb-2"><strong>Event:</strong> {eventName}</p>
                    {#each categories as category}
                        {#if category.quantity > 0}
                            <p class="mb-2">{category.name}: {category.quantity} ticket{#if category.quantity > 1}s{/if}</p>
                        {/if}
                    {/each}
                    <p class="mb-4"><strong>Total Price:</strong> RM {totalPrice}</p>
  
                    <h3 class="text-base font-medium mt-6 mb-3">Payment Method</h3>
                    <div class="mt-4">
                        <div class={`p-3 border rounded-lg mb-3 cursor-pointer transition-all ${
                            selectedPaymentMethod === 'Card' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`} on:click={() => selectPaymentMethod('Card')}>
                            <div class="flex items-center gap-3">
                                <img src="https://cdn-icons-png.flaticon.com/512/9063/9063313.png" alt="Billplz" class="w-8 h-8 rounded" />
                                <div>
                                    <span class="font-medium">Credit/Debit Card</span>
                                    <span class="block text-xs text-gray-500">Visa, Mastercard, etc.</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class={`p-3 border rounded-lg mb-3 cursor-pointer transition-all ${
                            selectedPaymentMethod === 'Spay' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`} on:click={() => selectPaymentMethod('Spay')}>
                            <div class="flex items-center gap-3">
                                <img src="https://play-lh.googleusercontent.com/_N6rLvVI8wwp8kCGEaAQBJtFBOwA62JUSp5vDxwBUDq1J0XCi8W4Wit3ECwdrwn3fyrr" alt="Spay" class="w-8 h-8 rounded" />
                                <div>
                                    <span class="font-medium">Spay</span>
                                    <span class="block text-xs text-gray-500">Alternative payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
  
                    <div class="mt-5 transition-all duration-300">
                        {#if showBillplzForm}
                            <div class="payment-form-container p-5 bg-gray-50 rounded-lg border border-gray-200 mb-5 animate-fade-in">
                                {#if error}
                                    <div class="text-red-500 mb-4 p-2.5 bg-red-50 rounded border border-red-200">{error}</div>
                                {/if}
                                
                                <form on:submit|preventDefault={handleBillplzSubmit}>
                                    <div class="mb-4">
                                        <label for="name" class="block text-sm mb-1">Full Name</label>
                                        <input type="text" id="name" bind:value={name} required class="w-full p-2.5 border border-gray-300 rounded" />
                                    </div>
                                
                                    <div class="mb-4">
                                        <label for="email" class="block text-sm mb-1">Email</label>
                                        <input type="email" id="email" bind:value={email} required class="w-full p-2.5 border border-gray-300 rounded" />
                                    </div>
                                
                                    <div class="mb-4">
                                        <label for="amount" class="block text-sm mb-1">Amount (MYR)</label>
                                        <input type="number" id="amount" bind:value={amount} min="1" step="0.01" readonly class="w-full p-2.5 border border-gray-300 rounded bg-gray-100" />
                                    </div>
                                
                                    <div class="mb-4">
                                        <label for="description" class="block text-sm mb-1">Description</label>
                                        <textarea id="description" bind:value={description} readonly class="w-full p-2.5 border border-gray-300 rounded bg-gray-100 min-h-20"></textarea>
                                    </div>
                                
                                    <button type="submit" class="w-full py-3.5 rounded text-white font-medium bg-blue-600 disabled:bg-gray-400" disabled={isLoading}>
                                        {isLoading ? 'Processing...' : 'Pay Now'}
                                    </button>
                                </form>
                            </div>
                        {/if}
                    
                        {#if showSpayForm}
                            <div class="payment-form-container p-5 bg-gray-50 rounded-lg border border-gray-200 mb-5 animate-fade-in">
                                <h3 class="text-base font-medium mt-0 mb-4">Spay Payment</h3>
                                <div class="flex flex-col items-center gap-4">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPAY-{totalPrice}-{Date.now()}" 
                                         alt="Spay QR Code" class="w-48 h-48 border border-gray-300 p-2 bg-white" />
                                    <p>Scan this QR code to complete your payment of RM {totalPrice}</p>
                                    <div class="bg-white p-4 rounded-lg border border-gray-200 mt-2 text-left">
                                        <p class="mb-2">1. Open Spay app on your phone</p>
                                        <p class="mb-2">2. Tap "Scan QR Code"</p>
                                        <p class="mb-0">3. Confirm the payment details</p>
                                    </div>
                                </div>
                                
                                <button 
                                    class="w-full py-3.5 rounded text-white font-medium bg-blue-600 mt-5" 
                                    on:click={confirmPayment}
                                >
                                    Complete Payment
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
        </main>
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