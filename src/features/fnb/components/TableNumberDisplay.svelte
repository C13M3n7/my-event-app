<script lang="ts">
    import { cart } from '../stores/cartStore';
    
    export let tableNumber: string;
    export let isFromQR: boolean;

    function handleTableChange(e: Event) {
        const target = e.target as HTMLInputElement;
        tableNumber = target.value;
        cart.setTableNumber(tableNumber);
    }
</script>

<div class="px-4 py-3 bg-blue-50 border-b border-blue-100">
    <div class="flex items-center justify-between">
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span class="font-medium text-gray-700">Table Number:</span>
        </div>
        
        {#if isFromQR}
            <div class="flex items-center">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {tableNumber}
                </span>
                <span class="ml-2 text-xs text-blue-600">(from QR code)</span>
            </div>
        {:else}
            <input
                type="text"
                bind:value={tableNumber}
                on:change={handleTableChange}
                class="px-3 py-1 border border-gray-300 rounded-md text-right font-medium w-20"
                maxlength="4"
            />
        {/if}
    </div>
</div>