<!-- src/features/fnb/components/CartSummaryModal.svelte -->
<script lang="ts">
  import { 
    cart, 
    clearVendorCart, 
    updateItemNote, 
    removeItem,
    getVendorSubtotal,
    getVendorItemCount
  } from '../stores/cartStore';
  import { fade, slide } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let isOpen: boolean = false;
  export let onClose: () => void;
  export let vendorId: string;

  let editItemIndex: number | null = null;
  let editQuantity: number = 1;
  let editNote: string = '';
  let cartContainer: HTMLElement;
  let showTopShadow: boolean = false;
  let showBottomShadow: boolean = false;

  // Derived store values for current vendor
  $: currentVendorCart = $cart[vendorId] || { vendor: null, items: [] };
  $: items = currentVendorCart.items || [];
  $: vendor = currentVendorCart.vendor;
  $: itemCount = getVendorItemCount($cart, vendorId);
  $: subtotal = getVendorSubtotal($cart, vendorId);

  // Open edit modal for specific item
  function openEditModal(index: number) {
    editItemIndex = index;
    editQuantity = items[index].quantity;
    editNote = items[index].note || '';
  }

  function handleClearCart() {
      if (confirm('Are you sure you want to clear your cart?')) {
          clearVendorCart(vendorId);
      }
  }

  function checkScrollPosition() {
      if (cartContainer) {
          showTopShadow = cartContainer.scrollTop > 10;
          showBottomShadow = cartContainer.scrollTop < 
              (cartContainer.scrollHeight - cartContainer.clientHeight - 10);
      }
  }

  onMount(() => {
      if (cartContainer) {
          cartContainer.addEventListener('scroll', checkScrollPosition);
          // Initial check
          setTimeout(checkScrollPosition, 50);
      }
      
      return () => {
          if (cartContainer) {
              cartContainer.removeEventListener('scroll', checkScrollPosition);
          }
      };
  });

  function saveEdit() {
    if (editItemIndex !== null && items[editItemIndex]) {
      updateItemNote(
        vendorId,
        items[editItemIndex].id,
        editNote.trim()
      );
      closeEditModal();
    }
  }

  function closeEditModal() {
    editItemIndex = null;
  }

  function handleRemoveItem(index: number) {
    if (items[index]) {
      removeItem(vendorId, items[index].id);
    }
  }

  function proceedToCheckout() {
    onClose();
    goto(`/payment?vendorId=${vendorId}`);
  }

  // Initialize scroll container reference
  onMount(() => {
      if (cartContainer) {
          cartContainer.scrollTop = 0;
      }
  });
</script>

{#if isOpen}
  <!-- Full-screen overlay -->
  <div
      class="fixed inset-0 z-50 bg-white flex flex-col"
      role="dialog"
      aria-modal="true"
      transition:fade
  >
      <!-- Header with clear button -->
      <div class="sticky top-0 z-20 bg-white px-5 py-4 flex items-center justify-between">
          <button
              on:click={onClose}
              class="text-gray-900 font-medium text-base"
              aria-label="Close cart summary"
          >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
          </button>
          <h2 class="text-lg font-semibold text-gray-900">Your Order</h2>
          {#if items.length > 0}
              <button 
                  on:click={handleClearCart}
                  class="text-sm text-gray-500 font-medium hover:text-gray-700"
              >
                  Clear
              </button>
          {:else}
              <div class="w-10"></div>
          {/if}
      </div>

      <!-- Scroll shadow indicators -->
      <div class="sticky top-14 z-10 h-2 w-full pointer-events-none">
          <div 
              class="h-full w-full bg-gradient-to-b from-black/10 to-transparent transition-opacity duration-200"
              class:opacity-0={!showTopShadow}
              class:opacity-100={showTopShadow}
          ></div>
      </div>

      <!-- Scrollable content area -->
      <div 
          class="flex-1 overflow-y-auto relative"
          bind:this={cartContainer}
      >
          <!-- Vendor info -->
          {#if vendor}
              <div class="px-5 py-4 border-b border-gray-100">
                  <div class="flex items-center gap-3">
                      {#if vendor.image}
                          <img
                              src={vendor.image}
                              alt={vendor.name}
                              class="h-10 w-10 rounded-full object-cover"
                          />
                      {:else}
                          <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                          </div>
                      {/if}
                      <div>
                          <p class="font-medium text-gray-900">{vendor.name}</p>
                          <p class="text-sm text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                      </div>
                  </div>
              </div>
          {/if}

          <!-- Cart items -->
          {#if items.length === 0}
              <div class="flex flex-col items-center justify-center h-64 text-center px-5">
                  <svg
                      class="h-16 w-16 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                      <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                  </svg>
                  <h3 class="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
                  <button
                      on:click={onClose}
                      class="mt-6 rounded-full bg-gray-900 px-6 py-3 text-white font-medium hover:bg-gray-800 active:bg-gray-700 transition-colors"
                  >
                      Browse Menu
                  </button>
              </div>
          {:else}
              <div class="divide-y divide-gray-100 pb-24">
                  {#each items as item, index (item.id)}
                      <div class="px-5 py-4">
                          <div class="flex gap-4">
                              {#if item.image}
                                  <img
                                      src={item.image}
                                      alt={item.name}
                                      class="h-20 w-20 rounded-lg object-cover"
                                  />
                              {:else}
                                  <div class="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                                      <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                  </div>
                              {/if}

                              <div class="flex-1 flex flex-col">
                                  <div class="flex justify-between">
                                      <p class="font-medium text-gray-900">{item.name}</p>
                                      <p class="font-medium text-gray-900">RM{(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                  <p class="text-sm text-gray-500 mt-1">RM{item.price.toFixed(2)} × {item.quantity}</p>
                                  
                                  {#if item.note}
                                      <p class="mt-2 text-xs text-gray-500">Note: {item.note}</p>
                                  {/if}

                                  {#if item.dietaryInfo}
                                      <div class="mt-2 flex flex-wrap gap-1">
                                          {#if item.dietaryInfo.halal}
                                              <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Halal</span>
                                          {/if}
                                          {#if item.dietaryInfo.vegetarian}
                                              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Vegetarian</span>
                                          {/if}
                                          {#if item.dietaryInfo.vegan}
                                              <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Vegan</span>
                                          {/if}
                                          {#if item.dietaryInfo.glutenFree}
                                              <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Gluten Free</span>
                                          {/if}
                                      </div>
                                  {/if}

                                  <div class="mt-3 flex gap-4">
                                      <button
                                          on:click={() => openEditModal(index)}
                                          class="text-sm text-gray-900 font-medium hover:text-gray-700 active:text-gray-800 transition-colors"
                                      >
                                          Edit
                                      </button>
                                      <button
                                          on:click={() => handleRemoveItem(index)}
                                          class="text-sm text-gray-900 font-medium hover:text-gray-700 active:text-gray-800 transition-colors"
                                      >
                                          Remove
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  {/each}
              </div>
          {/if}
      </div>

      <!-- Bottom scroll indicator -->
      <div class="sticky bottom-16 z-10 h-2 w-full pointer-events-none">
          <div 
              class="h-full w-full bg-gradient-to-t from-black/10 to-transparent transition-opacity duration-200"
              class:opacity-0={!showBottomShadow}
              class:opacity-100={showBottomShadow}
          ></div>
      </div>

      <!-- Fixed checkout footer -->
      {#if items.length > 0}
          <div class="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
              <div class="flex justify-between items-center mb-4">
                  <span class="text-gray-700">Subtotal</span>
                  <span class="font-semibold text-gray-900">RM{subtotal.toFixed(2)}</span>
              </div>
              <button
                  on:click={proceedToCheckout}
                  class="w-full rounded-full bg-gray-900 py-4 text-white font-medium hover:bg-gray-800 active:bg-gray-700 transition-colors"
              >
                  Proceed to Checkout
              </button>
          </div>
      {/if}
  </div>
{/if}

<!-- Edit Modal -->
{#if editItemIndex !== null && items[editItemIndex]}
  <div
      class="fixed inset-0 z-50 bg-white"
      role="dialog"
      aria-modal="true"
      transition:slide|local={{ duration: 300 }}
  >
      <!-- Minimal header -->
      <div class="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <button
              on:click={closeEditModal}
              class="text-gray-900 font-medium text-base"
          >
              Cancel
          </button>
          <h2 class="text-lg font-semibold text-gray-900">Edit Item</h2>
          <button
              on:click={saveEdit}
              class="text-gray-900 font-medium text-base"
          >
              Done
          </button>
      </div>
  
      <!-- Minimal edit content -->
      <div class="px-5 py-6">
          <!-- Larger item preview -->
          <div class="mb-6 flex justify-center">
              {#if items[editItemIndex].image}
                  <img
                      src={items[editItemIndex].image}
                      alt={items[editItemIndex].name}
                      class="h-32 w-32 rounded-lg object-cover"
                  />
              {:else}
                  <div class="h-32 w-32 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                  </div>
              {/if}
          </div>
  
          <!-- Minimal quantity control -->
          <div class="mb-6">
              <label for="quantity-input" class="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
              <div class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <button
                      on:click={() => editQuantity = Math.max(1, editQuantity - 1)}
                      class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      aria-label="Decrease quantity"
                  >
                      <svg class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                  </button>
                  <input
                      id="quantity-input"
                      type="number"
                      bind:value={editQuantity}
                      min="1"
                      class="text-lg font-medium text-center w-10 bg-transparent border-none focus:outline-none"
                      aria-label="Quantity"
                  />
                  <button
                      on:click={() => editQuantity++}
                      class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      aria-label="Increase quantity"
                  >
                      <svg class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                  </button>
              </div>
          </div>
  
          <!-- Minimal notes input -->
          <div>
              <label for="special-instructions" class="block text-sm font-medium text-gray-700 mb-3">Special Instructions</label>
              <textarea
                  id="special-instructions"
                  bind:value={editNote}
                  class="focus:ring-1 focus:ring-gray-300 focus:outline-none w-full px-4 py-3 bg-gray-50 rounded-lg focus:ring-1 focus:ring-gray-300 focus:bg-white border-none"
                  rows={3}
                  placeholder="Add note (optional)"
              ></textarea>
          </div>
      </div>
  </div>
{/if}

<style>
  /* Minimal transitions */
  button, input, textarea {
      transition: all 0.2s ease;
  }
  
  /* Button press effect */
  button:active {
      transform: scale(0.98);
  }

  /* Consistent minimal buttons */
  .btn-primary {
      @apply rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 active:bg-gray-700 transition-colors;
  }

  .btn-secondary {
      @apply rounded-full bg-white text-gray-900 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors border border-gray-200;
  }

  /* Make quantity input arrows invisible */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none;
      margin: 0;
  }
  input[type=number] {
      -moz-appearance: textfield;
  }
</style>