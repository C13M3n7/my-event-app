<script lang="ts">
    import { cartService } from '../services/cartService';
    import type { CartItem } from '../types/cart';
  
    export let item: CartItem;
    export let index: number;
  
    let showModal = false;
    let editState = {
        quantity: item.quantity,
        note: item.note || '',
        variant: item.variant || '',
        dietaryRestrictions: item.dietaryRestrictions?.join(', ') || ''
    };
  
    const handleSave = () => {
        cartService.updateItem(index, {
            quantity: editState.quantity,
            note: editState.note,
            variant: editState.variant,
            dietaryRestrictions: editState.dietaryRestrictions 
                ? editState.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean)
                : undefined
        });
        showModal = false;
    };
  
    const handleRemove = () => {
        cartService.removeItem(index);
    };
  
    // Handle keyboard events for modal backdrop
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        showModal = false;
      }
    };
  </script>
  
  <div class="flex gap-4 p-4 rounded-lg bg-white shadow-md">
    <img 
        src={item.image} 
        alt={item.name}
        class="w-20 h-20 object-cover rounded"
        on:error={() => item.image = '/images/fallback-food.png'}
    />
  
    <div class="flex-1">
        <h3>{item.name}</h3>
        {#if item.variant}
            <p class="text-sm text-gray-600">Variant: {item.variant}</p>
        {/if}
        <p class="font-medium">RM{item.price.toFixed(2)} × {item.quantity}</p>
        <p class="font-semibold">RM{(item.price * item.quantity).toFixed(2)}</p>
        
        {#if item.note}
            <p class="text-sm text-gray-600">Note: {item.note}</p>
        {/if}
        
        {#if item.dietaryRestrictions?.length}
            <div class="flex gap-1 mt-2">
                {#each item.dietaryRestrictions as tag}
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded-full">{tag}</span>
                {/each}
            </div>
        {/if}
    </div>
  
    <div class="flex flex-col gap-2">
        <button on:click={() => showModal = true} class="text-blue-500 text-sm p-1">✏️ Edit</button>
        <button on:click={handleRemove} class="text-red-500 text-sm p-1">🗑️ Remove</button>
    </div>
  
    {#if showModal}
        <div 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="modal-title"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
            on:click|self={() => showModal = false}
            on:keydown={handleKeyDown}
            tabindex="0"
        >
            <div class="bg-white p-6 rounded-lg w-[90%] max-w-md">
                <h3 id="modal-title" class="text-lg font-semibold mb-4">Edit Item</h3>
                
                <label class="block mb-2">
                    Quantity
                    <input 
                        type="number" 
                        bind:value={editState.quantity}
                        min="1"
                        class="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                </label>
                
                <label class="block mb-2">
                    Special Requests
                    <textarea 
                        bind:value={editState.note}
                        placeholder="No onions, extra spicy..."
                        class="w-full p-2 border border-gray-300 rounded mb-4"
                    ></textarea>
                </label>
                
                <label class="block mb-2">
                    Variant
                    <input 
                        bind:value={editState.variant}
                        placeholder="E.g. Spicy, Less Sugar"
                        class="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                </label>
                
                <label class="block mb-2">
                    Dietary Restrictions (comma separated)
                    <input 
                        bind:value={editState.dietaryRestrictions}
                        placeholder="Halal, Vegan, Gluten-free"
                        class="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                </label>
                
                <div class="flex justify-end gap-2 mt-4">
                    <button on:click={() => showModal = false} class="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                    <button on:click={handleSave} class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                </div>
            </div>
        </div>
    {/if}
  </div>