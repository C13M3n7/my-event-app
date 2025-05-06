<!-- src/routes/cart/+page.svelte -->
<script lang="ts">
  import CartSummaryModal from '$features/fnb/components/CartSummaryModal.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  let showModal = true;
  let vendorId: string | null = null;

  // Get vendorId from URL query params
  $: {
      if ($page.url.searchParams.has('vendorId')) {
          vendorId = $page.url.searchParams.get('vendorId');
      }
  }

  function closeModal() {
      // Navigate back to the vendor page if we have a vendorId
      if (vendorId) {
          goto(`/fnb-menu/${vendorId}`);
      } else {
          // Fallback to browser back navigation
          history.back();
      }
  }
</script>

<div class="min-h-screen bg-gray-50">
  {#if vendorId}
      <CartSummaryModal 
          isOpen={showModal} 
          onClose={closeModal} 
          vendorId={vendorId}
      />
  {:else}
      <div class="flex flex-col items-center justify-center h-screen text-center px-5">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No vendor selected</h3>
          <p class="mt-1 text-sm text-gray-500">Please go back to the vendor page</p>
          <button
              on:click={() => goto('/fnb-menu')}
              class="mt-6 rounded-full bg-gray-900 px-6 py-3 text-white font-medium hover:bg-gray-800 active:bg-gray-700 transition-colors"
          >
              Browse Vendors
          </button>
      </div>
  {/if}
</div>