<script lang="ts">
  import { cart } from '$lib/store';
  import { goto } from '$app/navigation';
  
  let showModal = false;
  let selectedIndex: number | null = null;
  let editQuantity = 1;
  let editNote = '';

  function handleCheckout() {
      goto('/checkout');
  }

  function openEditModal(index: number) {
      selectedIndex = index;
      const item = $cart[index];
      editQuantity = item.quantity;
      editNote = item.note || '';
      showModal = true;
  }

  function saveEdit() {
      if (selectedIndex !== null) {
          cart.update(items => {
              const updated = [...items];
              updated[selectedIndex] = {
                  ...updated[selectedIndex],
                  quantity: editQuantity,
                  note: editNote
              };
              return updated;
          });
      }
      closeModal();
  }

  function closeModal() {
      showModal = false;
      selectedIndex = null;
  }

  function removeItem(index: number) {
      cart.update(items => items.filter((_, i) => i !== index));
  }

  function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
          closeModal();
      }
  }

  $: subtotal = $cart.reduce((total, item) => total + (item.price * item.quantity), 0);
</script>

<div class="p-4 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-6">🛒 My Cart</h1>

  {#if $cart.length === 0}
      <div class="text-center py-8">
          <p class="text-gray-500">Your cart is empty</p>
          <a href="/fnb-menu" class="text-blue-600 hover:underline">Browse menu</a>
      </div>
  {:else}
      <div class="space-y-4">
          {#each $cart as item, index}
              <div class="bg-white shadow-lg rounded-xl p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <img 
                      src={item.image} 
                      alt={item.name} 
                      class="w-24 h-24 rounded-lg object-cover"
                      on:error={() => item.image = '/fallback.png'}
                  />
    
                  <div class="flex-1">
                      <p class="text-lg font-bold">{item.name}</p>
                      <p class="text-sm text-gray-500">RM {item.price.toFixed(2)} × {item.quantity}</p>
                      <p class="text-sm font-medium text-gray-700">
                          Subtotal: RM {(item.price * item.quantity).toFixed(2)}
                      </p>
                      
                      {#if item.note}
                          <p class="text-xs text-gray-400 italic mt-1">Remarks: {item.note}</p>
                      {/if}
                  </div>
    
                  <div class="flex flex-col gap-2">
                      <button 
                          class="text-blue-600 hover:underline text-sm" 
                          on:click={() => openEditModal(index)}
                      >
                          ✏️ Edit
                      </button>
                      <button 
                          class="text-red-500 hover:underline text-sm" 
                          on:click={() => removeItem(index)}
                      >
                          🗑️ Remove
                      </button>
                  </div>
              </div>
          {/each}
      </div>

      <div class="mt-8 border-t pt-4">
          <div class="flex justify-between items-center">
              <p class="text-lg font-semibold">
                  Total: RM {subtotal.toFixed(2)}
              </p>
              <button 
                  class="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                  on:click={handleCheckout}
              >
                  Checkout
              </button>
          </div>
      </div>
  {/if}

  <!-- Edit Modal -->
  {#if showModal}
      <div 
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity"
          on:click|self={closeModal}
          on:keydown={handleKeydown}
          role="dialog"
          aria-modal="true"
          tabindex="0"
      >
          <div class="bg-white p-6 rounded-2xl max-w-md shadow-lg space-y-4 animate-fade-in">
              <h2 class="text-xl font-bold">Edit Item</h2>
    
              <div class="space-y-4">
                  <label class="block">
                      Quantity
                      <div class="flex border rounded-md mt-1 w-32">
                          <button 
                              on:click={() => editQuantity = Math.max(1, editQuantity - 1)} 
                              class="px-3 bg-gray-100 hover:bg-gray-200"
                          >
                              −
                          </button>
                          <input 
                              type="number" 
                              min="1" 
                              bind:value={editQuantity} 
                              class="w-full text-center border-x" 
                          />
                          <button 
                              on:click={() => editQuantity++} 
                              class="px-3 bg-gray-100 hover:bg-gray-200"
                          >
                              +
                          </button>
                      </div>
                  </label>
    
                  <label class="block">
                      Remarks
                      <textarea 
                          bind:value={editNote} 
                          class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 mt-1" 
                          rows="3"
                          placeholder="Any special instructions..."
                      ></textarea>
                  </label>
              </div>
    
              <div class="flex justify-end gap-3 pt-2">
                  <button 
                      on:click={closeModal} 
                      class="px-4 py-2 border rounded-md hover:bg-gray-100"
                  >
                      Cancel
                  </button>
                  <button 
                      on:click={saveEdit} 
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                      Save Changes
                  </button>
              </div>
          </div>
      </div>
  {/if}
</div>

<style>
  .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
  }
</style>