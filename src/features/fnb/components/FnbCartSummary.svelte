<!-- features/fnb/components/FnbCartSummary.svelte -->
<script lang="ts">
  export let subtotal: number;
  export let points: number;
  export let total: number;
</script>

<div class="bg-gray-50 p-4 rounded-lg border mb-6">
  <div class="space-y-2">
    <div class="flex justify-between">
      <span>Subtotal:</span>
      <span>RM {subtotal.toFixed(2)}</span>
    </div>
    {#if points > 0}
      <div class="flex justify-between text-green-600">
        <span>Points Discount:</span>
        <span>- RM {points.toFixed(2)}</span>
      </div>
    {/if}
    <div class="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
      <span>Total:</span>
      <span>RM {total.toFixed(2)}</span>
    </div>
  </div>
</div>