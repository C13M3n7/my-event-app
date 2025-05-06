<!-- src/routes/vendor-dashboard/orders/+page.svelte -->
<script lang="ts">
  import OrderList from '$features/vendorDashboard/components/OrderList.svelte';
  import type { OrderStatus } from '$features/fnb/types/order';

  // Simplified tabs without 'ready' and 'cancelled'
  const tabs: { id: OrderStatus; label: string }[] = [
    { id: 'pending', label: 'Pending' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'completed', label: 'Completed' }
  ];

  let activeTab: OrderStatus = 'pending';
</script>

<div class="container mx-auto px-4 py-6">
  <h1 class="text-2xl font-bold mb-6">Order Management</h1>
  
  <!-- Tab Navigation -->
  <div class="border-b border-gray-200 mb-6">
    <nav class="-mb-px flex space-x-8 overflow-x-auto">
      {#each tabs as tab}
        <button
          on:click={() => (activeTab = tab.id)}
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
          class:border-blue-500={activeTab === tab.id}
          class:text-blue-500={activeTab === tab.id}
          class:border-transparent={activeTab !== tab.id}
          class:text-gray-500={activeTab !== tab.id}
          class:hover:text-gray-700={activeTab !== tab.id}
          class:hover:border-gray-300={activeTab !== tab.id}
        >
          {tab.label}
        </button>
      {/each}
    </nav>
  </div>

  <!-- Order List -->
  <OrderList status={activeTab} />
</div>