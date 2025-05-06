<!-- src/features/vendorDashboard/components/OrderList.svelte -->
<script lang="ts">
  import { updateOrderStatus } from '$features/vendorDashboard/services/vendorService';
  import type { Order, OrderStatus } from '$features/fnb/types/order';

  export let status: OrderStatus;

  // Sample data - replace with your actual data source
  let orders: Order[] = [
    {
      id: '1',
      customerName: 'John Doe',
      items: [
        { id: '101', name: 'Burger', quantity: 2, price: 8.99 },
        { id: '102', name: 'Fries', quantity: 1, price: 3.99 }
      ],
      total: 21.97,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: 'No onions please'
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      items: [
        { id: '103', name: 'Pizza', quantity: 1, price: 12.99 }
      ],
      total: 12.99,
      status: 'preparing',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // Filter orders by current tab status
  $: filteredOrders = orders.filter(order => order.status === status);

  // Updated status transitions without 'ready' and 'cancelled'
  const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['preparing'],
    preparing: ['completed'],
    completed: [],
    cancelled: [] // This can likely be removed entirely if you don't use cancelled status
  };

  // Update order status
  async function changeStatus(orderId: string, newStatus: OrderStatus) {
    try {
      // Update locally first for instant feedback
      orders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      // Simulate API call
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Revert if error
      orders = orders.map(order => 
        order.id === orderId ? { ...order, status: status } : order
      );
      alert('Failed to update order status. Please try again.');
    }
  }

  // Format date/time
  function formatDateTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleString();
  }
</script>

<div class="space-y-4">
  {#if filteredOrders.length === 0}
    <div class="bg-white rounded-lg shadow p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
      <p class="mt-1 text-sm text-gray-500">You don't have any {status} orders at this time.</p>
    </div>
  {:else}
    {#each filteredOrders as order (order.id)}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 class="font-medium">Order #{order.id}</h3>
            <p class="text-sm text-gray-500">Customer: {order.customerName}</p>
          </div>
          <div class="text-sm text-gray-500">
            {formatDateTime(order.createdAt)}
          </div>
        </div>

        <div class="p-4">
          <h4 class="font-medium mb-2">Items:</h4>
          <ul class="divide-y divide-gray-200">
            {#each order.items as item (item.id)}
              <li class="py-2 flex justify-between">
                <div>
                  <span class="font-medium">{item.quantity}x</span> {item.name}
                </div>
                <div>${(item.price * item.quantity).toFixed(2)}</div>
              </li>
            {/each}
          </ul>
        </div>

        {#if order.notes}
          <div class="px-4 pb-4">
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-2">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-yellow-700">
                    {order.notes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <div class="px-4 py-3 bg-gray-50 flex justify-between items-center">
          <div class="font-medium">Total: ${order.total.toFixed(2)}</div>
          
          <div class="flex space-x-2">
            {#each statusTransitions[order.status] as nextStatus}
              <button
                on:click={() => changeStatus(order.id, nextStatus)}
                class="px-3 py-1 rounded-md text-sm font-medium"
                class:bg-blue-100={nextStatus === 'completed'}
                class:text-blue-800={nextStatus === 'completed'}
                class:bg-gray-100={nextStatus === 'preparing'}
                class:text-gray-800={nextStatus === 'preparing'}
              >
                {#if nextStatus === 'preparing'}
                  Mark as Preparing
                {:else if nextStatus === 'completed'}
                  Complete Order
                {/if}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>