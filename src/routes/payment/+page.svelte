<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { createBill } from '$lib/billplz.js';
  import { addDoc, collection, updateDoc, db } from '$lib/firebase.js';

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
  let eventName = $page.url.searchParams.get('event') || "Harvest Fusion Festival 2025";
  let eventType = $page.url.searchParams.get('type') || "festival";
  let basePrice = parseInt($page.url.searchParams.get('price') || "50");
  
  // Initialize categories based on event type
  let categories: Category[] = [
    { id: 1, name: "General Admission", price: `RM ${basePrice}`, quantity: 0 }
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
    setTimeout(() => {
      const formElement = document.querySelector('.payment-form-container');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
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
            redirect_url: `${window.location.origin}/payment-confirmation?payment_id=${paymentRef.id}`
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

<div class="ticket-container">
  <!-- Header Navigation -->
  <header class="app-header">
      {#if showTicketHistory || selectedTicket}
          <button class="back-button" on:click={returnToHome}>
              <span class="back-arrow">←</span> Back
          </button>
      {:else}
          <button class="ticket-history-button" on:click={showTickets}>
              My Tickets →
          </button>
      {/if}
  </header>

  {#if showTicketHistory && !selectedTicket}
      <!-- Ticket History List -->
      <main class="content">
          <div class="ticket-history">
              <h1>Your Tickets</h1>
              
              {#if purchasedTickets.length === 0}
                  <div class="empty-state">
                      <p>You haven't purchased any tickets yet.</p>
                  </div>
              {:else}
                  <div class="ticket-list">
                      {#each purchasedTickets as ticket}
                          <div class="ticket-item" on:click={() => viewTicketDetails(ticket)}>
                              <div class="ticket-item-image">
                                  {#if ticket.event.includes('Festival')}
                                      <div class="event-icon festival-icon">🎪</div>
                                  {:else if ticket.event.includes('Concert')}
                                      <div class="event-icon music-icon">🎵</div>
                                  {:else}
                                      <div class="event-icon generic-icon">🎟️</div>
                                  {/if}
                              </div>
                              <div class="ticket-item-details">
                                  <h3>{ticket.event}</h3>
                                  <p class="ticket-date">{ticket.date}</p>
                                  <p class="ticket-category">{ticket.category} × {ticket.quantity}</p>
                                  <div class="ticket-status-row">
                                      <span class="ticket-status" class:status-active={ticket.status === 'Active'} class:status-used={ticket.status === 'Used'}>
                                          {ticket.status}
                                      </span>
                                      <span class="ticket-price">{ticket.paymentMethod === 'Free' ? 'FREE' : `RM ${ticket.price}`}</span>
                                  </div>
                              </div>
                              <div class="ticket-item-arrow">
                                  <span>›</span>
                              </div>
                          </div>
                      {/each}
                  </div>
              {/if}
          </div>
      </main>
  
  {:else if selectedTicket}
      <!-- Single Ticket Details -->
      <main class="content">
          <div class="ticket-detail">
              <div class="ticket-detail-header">
                  <div class="ticket-detail-event">
                      <h2>{selectedTicket.event}</h2>
                      <p>{selectedTicket.date}</p>
                  </div>
                  <div class="ticket-quantity">x{selectedTicket.quantity}</div>
              </div>
              
              <div class="ticket-scan-code">
                  <img src={selectedTicket.qrCode} alt="QR Code" class="ticket-qr-code" />
              </div>
              
              <div class="ticket-info-section">
                  <div class="ticket-info-row">
                      <span class="info-label">Status</span>
                      <span class="info-value status-pill" class:status-active={selectedTicket.status === 'Active'} class:status-used={selectedTicket.status === 'Used'}>
                          {selectedTicket.status}
                      </span>
                  </div>
                  <div class="ticket-info-row">
                      <span class="info-label">Booking ID:</span>
                      <span class="info-value">{selectedTicket.id}</span>
                  </div>
                  <div class="ticket-info-row">
                      <span class="info-label">Ticket Type:</span>
                      <span class="info-value">{selectedTicket.category}</span>
                  </div>
              </div>
              
              <div class="ticket-info-section payment-details">
                  <h3>Payment Details</h3>
                  <div class="ticket-info-row">
                      <span class="info-label">Order Time</span>
                      <span class="info-value">{new Date().toLocaleDateString()}, {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div class="ticket-info-row">
                      <span class="info-label">Paid with</span>
                      <span class="info-value payment-method">
                          {#if selectedTicket.paymentMethod === 'Card'}
                              <span class="payment-icon billplz">B</span>
                          {:else if selectedTicket.paymentMethod === 'Spay'}
                              <span class="payment-icon spay">S</span>
                          {:else}
                              <span class="payment-icon free">FREE</span>
                          {/if}
                      </span>
                  </div>
                  {#if selectedTicket.paymentMethod !== 'Free'}
                      <div class="ticket-info-row total-row">
                          <span class="info-label">Order Total</span>
                          <span class="info-value">RM {selectedTicket.price.toFixed(2)}</span>
                      </div>
                  {:else}
                      <div class="ticket-info-row total-row">
                          <span class="info-label">Order Total</span>
                          <span class="info-value">FREE</span>
                      </div>
                  {/if}
              </div>
              
              {#if selectedTicket.paymentMethod !== 'Free'}
                  <button class="wallet-button" on:click={addToWallet}>
                      Add to Apple Wallet
                  </button>
              {/if}
          </div>
      </main>
      
  {:else if paymentSuccess}
      <!-- Payment Success Screen -->
      <main class="content">
          <div class="success-message">
              <h1>Payment Successful!</h1>
              <p>Thank you for purchasing tickets to {eventName}!</p>
              
              <div class="qr-code-container">
                  <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          `EVENT:${eventName}|REF:${paymentReference}|AMOUNT:${eventType === 'free' ? 'FREE' : `RM${totalPrice}`}|DATE:${new Date().toLocaleDateString()}`
                      )}`} 
                      alt="Event Ticket QR Code"
                      class="success-qr-code"
                  />
                  <p class="qr-instruction">Show this QR code at the event entrance</p>
              </div>
              
              <div class="order-summary">
                  <h2>Order Summary</h2>
                  <p><strong>Event:</strong> {eventName}</p>
                  <p><strong>Reference:</strong> {paymentReference}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  {#each categories as category}
                      {#if category.quantity > 0}
                          <p>{category.name}: {category.quantity} ticket{#if category.quantity > 1}s{/if}</p>
                      {/if}
                  {/each}
                  <p><strong>Total Price:</strong> {eventType === 'free' ? 'FREE' : `RM ${totalPrice}`}</p>
              </div>
              
              <div class="success-actions">
                  <button class="download-button" on:click={downloadTicket}>Download E-Ticket (PDF)</button>
                  <button class="view-tickets-button" on:click={showTickets}>View My Tickets</button>
                  <button class="return-button" on:click={returnToHome}>Return To Home</button>
              </div>
          </div>
      </main>
  
  {:else}
      <!-- Ticket Purchase Screen -->
      <main class="content">
          {#if processingPayment}
              <div class="loading-overlay">
                  <div class="spinner"></div>
                  <p>Processing payment...</p>
              </div>
          {/if}
          
          <h1>Purchase Tickets for {eventName}</h1>
          
          {#each categories as category, index}
              <div class="form-group">
                  <label for="cat-{category.id}">{category.name} - {category.price}</label>
                  <div class="number-input">
                      <input 
                          type="number" 
                          id="cat-{category.id}" 
                          min="0" 
                          max={eventType === 'free' ? 1 : undefined}
                          bind:value={category.quantity}
                          on:input={() => handleQuantityChange(index, category.quantity)}
                          disabled={eventType === 'free' && index > 0}
                      >
                  </div>
              </div>
          {/each}
          
          <div class="total-price">
              <p>Total Price: {eventType === 'free' ? 'FREE' : `RM ${totalPrice}`}</p>
          </div>
          
          <button class="payment-button" on:click={proceedToPayment}>
              {eventType === 'free' ? 'Get Free Ticket' : 'Proceed to Payment'}
          </button>

          {#if showPaymentSection && eventType !== 'free'}
              <div id="payment-section" class="payment-section">
                  <h2>Order Summary</h2>
                  <p><strong>Event:</strong> {eventName}</p>
                  {#each categories as category}
                      {#if category.quantity > 0}
                          <p>{category.name}: {category.quantity} ticket{#if category.quantity > 1}s{/if}</p>
                      {/if}
                  {/each}
                  <p><strong>Total Price:</strong> RM {totalPrice}</p>

                  <h3>Payment Method</h3>
                  <div class="payment-methods">
                      <div class="payment-method" class:selected={selectedPaymentMethod === 'Card'} on:click={() => selectPaymentMethod('Card')}>
                          <div class="payment-method-content">
                              <img src="https://cdn-icons-png.flaticon.com/512/9063/9063313.png" alt="Billplz" class="payment-icon" />
                              <div class="payment-details">
                                  <span class="payment-name">Credit/Debit Card</span>
                                  <span class="payment-description">Visa, Mastercard, etc.</span>
                              </div>
                          </div>
                      </div>
                      
                      <div class="payment-method" class:selected={selectedPaymentMethod === 'Spay'} on:click={() => selectPaymentMethod('Spay')}>
                          <div class="payment-method-content">
                              <img src="https://play-lh.googleusercontent.com/_N6rLvVI8wwp8kCGEaAQBJtFBOwA62JUSp5vDxwBUDq1J0XCi8W4Wit3ECwdrwn3fyrr" alt="Spay" class="payment-icon" />
                              <div class="payment-details">
                                  <span class="payment-name">Spay</span>
                                  <span class="payment-description">Alternative payment</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div class="payment-form-container">
                      {#if showBillplzForm}
                          <div class="billplz-form payment-form">
                              {#if error}
                                  <div class="error">{error}</div>
                              {/if}
                              
                              <form on:submit|preventDefault={handleBillplzSubmit}>
                                  <div class="form-group">
                                      <label for="name">Full Name</label>
                                      <input type="text" id="name" bind:value={name} required />
                                  </div>
                              
                                  <div class="form-group">
                                      <label for="email">Email</label>
                                      <input type="email" id="email" bind:value={email} required />
                                  </div>
                              
                                  <div class="form-group">
                                      <label for="amount">Amount (MYR)</label>
                                      <input type="number" id="amount" bind:value={amount} min="1" step="0.01" readonly />
                                  </div>
                              
                                  <div class="form-group">
                                      <label for="description">Description</label>
                                      <textarea id="description" bind:value={description} readonly />
                                  </div>
                              
                                  <button type="submit" class="confirm-button" disabled={isLoading}>
                                      {isLoading ? 'Processing...' : 'Pay Now'}
                                  </button>
                              </form>
                          </div>
                      {/if}
                  
                      {#if showSpayForm}
                          <div class="spay-form payment-form">
                              <h3>Spay Payment</h3>
                              <div class="qr-code-container">
                                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SPAY-{totalPrice}-{Date.now()}" 
                                       alt="Spay QR Code" class="qr-code" />
                                  <p>Scan this QR code to complete your payment of RM {totalPrice}</p>
                                  <div class="spay-instructions">
                                      <p>1. Open Spay app on your phone</p>
                                      <p>2. Tap "Scan QR Code"</p>
                                      <p>3. Confirm the payment details</p>
                                  </div>
                              </div>
                              
                              <button 
                                  class="confirm-button" 
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
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f5f5f5;
  }
  
  .ticket-container {
    max-width: 400px;
    min-height: 100vh;
    margin: 0 auto;
    background-color: white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    position: relative;
  }
  
  /* Add new festival icon style */
  .festival-icon {
    background-color: #fff8e1;
  }
  
  /* Event Type Toggle Styles */
  .event-type-toggle {
    display: flex;
    justify-content: center;
    padding: 10px;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }
  
  .event-type-toggle button {
    padding: 8px 12px;
    margin: 0 5px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .event-type-toggle button.active {
    background-color: #4353e8;
    color: white;
    border-color: #4353e8;
  }
  
  .app-header {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #fff;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .header-title {
    flex: 1;
    text-align: center;
    font-weight: 600;
    font-size: 16px;
  }
  
  .back-button, .ticket-history-button {
    background: none;
    border: none;
    font-size: 15px;
    cursor: pointer;
    padding: 5px;
    display: flex;
    align-items: center;
  }
  
  .back-arrow {
    margin-right: 5px;
    font-weight: bold;
  }
  
  .content {
    padding: 20px;
    padding-bottom: 40px;
    position: relative;
  }
  
  h1 {
    font-size: 22px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 24px;
  }
  
  h2 {
    font-size: 18px;
    margin-top: 30px;
    margin-bottom: 15px;
  }
  
  h3 {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  /* Ticket History Styles */
  .ticket-history {
    padding-bottom: 20px;
  }
  
  .empty-state {
    text-align: center;
    padding: 30px 0;
    color: #666;
  }
  
  .ticket-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .ticket-item {
    display: flex;
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    border: 1px solid #eee;
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .ticket-item:hover {
    transform: translateY(-2px);
  }
  
  .ticket-item-image {
    width: 70px;
    background-color: #f7f7f7;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .event-icon {
    font-size: 24px;
    padding: 12px;
    border-radius: 50%;
    background-color: #e9e9e9;
  }
  
  .music-icon {
    background-color: #e6f7ff;
  }
  
  .theater-icon {
    background-color: #fff2e8;
  }
  
  .sports-icon {
    background-color: #e8f5e9;
  }
  
  .ticket-item-details {
    flex: 1;
    padding: 10px 15px;
  }
  
  .ticket-item-details h3 {
    margin: 0 0 5px 0;
    font-size: 16px;
  }
  
  .ticket-date {
    color: #666;
    font-size: 14px;
    margin: 0 0 5px 0;
  }
  
  .ticket-category {
    font-size: 13px;
    margin: 0 0 8px 0;
  }
  
  .ticket-status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .ticket-status {
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 500;
  }
  
  .status-active {
    background-color: #e6f7ff;
    color: #0066cc;
  }
  
  .status-used {
    background-color: #f0f0f0;
    color: #666;
  }
  
  .ticket-price {
    font-weight: 600;
    font-size: 14px;
  }
  
  .ticket-item-arrow {
    display: flex;
    align-items: center;
    padding: 0 15px;
    color: #ccc;
    font-size: 20px;
  }
  
  /* Ticket Detail Styles */
  .ticket-detail {
    padding-bottom: 20px;
  }
  
  .ticket-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .ticket-detail-event h2 {
    margin: 0 0 5px 0;
  }
  
  .ticket-detail-event p {
    margin: 0;
    color: #666;
  }
  
  .ticket-quantity {
    background-color: #f0f0f0;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
  
  .ticket-scan-code {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  .ticket-qr-code {
    width: 200px;
    height: 200px;
  }
  
  .ticket-barcode {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
  }
  
  .barcode-svg {
    width: 100%;
    height: 50px;
  }
  
  .barcode-text {
    margin-top: 5px;
    font-size: 12px;
    letter-spacing: 1px;
  }
  
  .ticket-info-section {
    margin-bottom: 20px;
    border-top: 1px solid #eee;
    padding-top: 15px;
  }
  
  .ticket-info-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
  }
  
  .info-label {
    color: #666;
    font-size: 14px;
  }
  
  .info-value {
    font-weight: 500;
    font-size: 14px;
  }
  
  .status-pill {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
  }
  
  .payment-details h3 {
    margin-top: 0;
    margin-bottom: 15px;
  }
  
  .link {
    color: #0066cc;
  }
  
  .payment-method {
    display: flex;
    align-items: center;
  }
  
  .payment-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
    color: white;
    font-size: 12px;
  }
  
  .payment-icon.billplz {
    background-color: #0066cc;
  }
  
  .payment-icon.spay {
    background-color: #23b899;
  }
  
  .payment-icon.free {
    background-color: #4CAF50;
    width: auto;
    padding: 0 8px;
    font-size: 11px;
  }
  
  .points-row {
    color: #23b899;
  }
  
  .total-row {
    font-weight: bold;
  }
  
  .points-earned {
    color: #f5a623;
  }
  
  .wallet-button {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    background-color: #3478f5;
    color: white;
    margin-top: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  /* Form Styles */
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  select, input, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    appearance: none;
  }
  
  .select-wrapper, .number-input {
    position: relative;
  }
  
  .select-wrapper::after {
    content: "▼";
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 12px;
  }
  
  .total-price {
    margin: 20px 0;
    font-weight: bold;
    font-size: 16px;
  }
  
  .payment-button, .confirm-button, .download-button, .return-button, .view-tickets-button {
    width: 100%;
    padding: 14px;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 10px;
  }
  
  .payment-button, .confirm-button {
    background-color: #4353e8;
    color: white;
  }
  
  .payment-button:hover, .confirm-button:hover {
    background-color: #3a46c9;
  }
  
  .confirm-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .payment-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
  
  .payment-methods {
    margin-top: 15px;
  }
  
  .payment-method {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .payment-method:hover {
    border-color: #ddd;
  }

  .payment-method.selected {
    border-color: #4353e8;
    background-color: #f0f4ff;
  }

  .payment-method-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .payment-icon {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    object-fit: contain;
  }

  .payment-details {
    display: flex;
    flex-direction: column;
  }

  .payment-name {
    font-weight: 500;
  }

  .payment-description {
    font-size: 12px;
    color: #666;
  }

  .payment-form-container {
    margin-top: 20px;
    transition: all 0.3s ease;
  }
  
  .payment-form {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #eee;
    margin-bottom: 20px;
    animation: fadeIn 0.3s ease-out;
  }
  
  .billplz-form h3, .spay-form h3 {
    margin-top: 0;
  }
  
  .card-details {
    display: flex;
    gap: 15px;
  }
  
  .card-details .form-group {
    flex: 1;
  }
  
  .spay-form {
    text-align: center;
  }
  
  .qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .qr-code {
    width: 200px;
    height: 200px;
    border: 1px solid #ddd;
    padding: 10px;
    background: white;
  }
  
  .spay-instructions {
    text-align: left;
    background: white;
    padding: 15px;
    border-radius: 8px;
    margin-top: 10px;
    border: 1px solid #eee;
  }
  
  .spay-instructions p {
    margin: 8px 0;
  }
  
  .success-message {
    text-align: center;
    padding: 20px;
  }
  
  .success-message h1 {
    color: #4CAF50;
  }
  
  .success-message p {
      margin-bottom: 15px;
      line-height: 1.5;
    }
    
    .order-summary {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      text-align: left;
    }
    
    .success-qr-code {
      width: 200px;
      height: 200px;
      border: 1px solid #ddd;
      padding: 15px;
      background: white;
      margin: 20px auto;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .qr-instruction {
      font-size: 14px;
      color: #666;
      margin-top: -10px;
      margin-bottom: 20px;
    }
    
    .success-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }
    
    .download-button {
      background-color: #4CAF50;
      color: white;
    }
    
    .download-button:hover {
      background-color: #3e8e41;
    }
    
    .view-tickets-button {
      background-color: #4353e8;
      color: white;
    }
    
    .view-tickets-button:hover {
      background-color: #3a46c9;
    }
    
    .return-button {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    }
    
    .return-button:hover {
      background-color: #e9e9e9;
    }
    
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 100;
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
    
    .error {
      color: red;
      margin-bottom: 15px;
      padding: 10px;
      background-color: #ffeeee;
      border-radius: 4px;
      border: 1px solid #ffcccc;
    }
    
    textarea {
      min-height: 80px;
      resize: vertical;
    }
    
    button[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
</style>