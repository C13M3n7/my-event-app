<!-- Reusable button component -->
<script lang="ts">
  export let item: any;
  export let index: number;
  export let onEdit: (index: number) => void;
  export let onRemove: (index: number) => void;
</script>

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
      on:click={() => onEdit(index)}
    >
      ✏️ Edit
    </button>
    <button 
      class="text-red-500 hover:underline text-sm" 
      on:click={() => onRemove(index)}
    >
      🗑️ Remove
    </button>
  </div>
</div>