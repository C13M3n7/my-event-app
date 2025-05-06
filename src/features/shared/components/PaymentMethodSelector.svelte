<script context="module" lang="ts">
  export type PaymentMethod = 'Billplz' | 'Spay' | 'Cash';
  export type PaymentContext = 'fnb' | 'tickets';
</script>

<script lang="ts">
  const methodOptions: Record<PaymentContext, PaymentMethod[]> = {
    fnb: ['Billplz', 'Spay', 'Cash'],
    tickets: ['Billplz', 'Spay']
  };

  const methodDetails = {
    Billplz: {
      icon: '💳',
      name: 'Billplz',
      description: 'Credit/Debit Card',
      selectedClass: 'border-[#4353e8] bg-[#f0f4ff]'
    },
    Spay: {
      icon: '📱',
      name: 'Spay',
      description: 'Mobile Payment',
      selectedClass: 'border-[#4353e8] bg-[#f0f4ff]'
    },
    Cash: {
      icon: '💰',
      name: 'Cash',
      description: 'Pay at Vendor',
      selectedClass: 'border-[#4353e8] bg-[#f0f4ff]'
    }
  };

  export let selectedMethod: PaymentMethod | null = null;
  export let context: PaymentContext;
  export let disabled = false;
</script>

<div class="my-6">
  <h3 class="text-[1.1rem] mb-3">Select Payment Method</h3>

  <div class="flex flex-col gap-2">
    {#each methodOptions[context] as method}
      <button
        class="flex items-center gap-4 p-4 w-full text-left bg-white border border-[#ddd] rounded-lg transition"
        class:opacity-50={disabled}
        class:cursor-not-allowed={disabled}
        class:selected={selectedMethod === method}
        on:click={() => !disabled && (selectedMethod = method)}
      >
        <span class="text-[1.5rem]">{methodDetails[method].icon}</span>
        <div class="flex-1">
          <span class="block font-medium">{methodDetails[method].name}</span>
          <span class="block text-[0.9rem] text-[#666]">{methodDetails[method].description}</span>
        </div>
        {#if selectedMethod === method}
          <span class="text-[#4353e8] font-bold">✓</span>
        {/if}
      </button>

      <style>
        button.selected {
          border-color: #4353e8;
          background-color: #f0f4ff;
        }
      </style>
    {/each}
  </div>
</div>