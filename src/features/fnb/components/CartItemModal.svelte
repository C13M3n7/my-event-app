<script lang="ts">
  export let isOpen: boolean;
  export let quantity: number;
  export let note: string;
  export let onSave: () => void;
  export let onClose: () => void;

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose();
  }
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity"
    on:click|self={onClose}
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
              on:click={() => quantity = Math.max(1, quantity - 1)} 
              class="px-3 bg-gray-100 hover:bg-gray-200"
            >
              −
            </button>
            <input 
              type="number" 
              min="1" 
              bind:value={quantity} 
              class="w-full text-center border-x" 
            />
            <button 
              on:click={() => quantity++} 
              class="px-3 bg-gray-100 hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </label>

        <label class="block">
          Remarks
          <textarea 
            bind:value={note} 
            class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 mt-1" 
            rows="3"
            placeholder="Any special instructions..."
          ></textarea>
        </label>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button 
          on:click={onClose} 
          class="px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Cancel
        </button>
        <button 
          on:click={onSave} 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}
