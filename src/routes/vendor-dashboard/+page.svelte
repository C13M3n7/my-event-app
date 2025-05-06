<script lang="ts">
  import { onMount } from 'svelte';

  let ordersToday = 42;
  let pendingOrders = 5;
  let revenueToday = 1280.50;
  let rating = 4.7;

  onMount(() => {
    document.body.className = 'bg-[#f5f9f8] text-[#1a1a1a] font-sans m-0';
  });
</script>
  
<!-- Vendor Dashboard Section -->
<main class="container mx-auto px-4 py-6">
  <!-- Header Section -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold">Good morning, Heng</h1>
      <p class="text-gray-500">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
    </div>
    <div class="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
      <span class="font-medium">{rating}</span>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <!-- Today's Orders Card -->
    <div class="bg-white p-5 rounded-xl shadow-sm">
      <p class="text-gray-500 text-sm">Today's Orders</p>
      <p class="text-3xl font-semibold mt-1">{ordersToday}</p>
      <p class="text-green-500 text-sm mt-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span class="ml-1">12% from yesterday</span>
      </p>
    </div>

    <!-- Pending Orders Card -->
    <div class="bg-white p-5 rounded-xl shadow-sm">
      <p class="text-gray-500 text-sm">Pending Orders</p>
      <p class="text-3xl font-semibold mt-1">{pendingOrders}</p>
      <p class="text-red-500 text-sm mt-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span class="ml-1">2 new in last hour</span>
      </p>
    </div>

    <!-- Revenue Card -->
    <div class="bg-white p-5 rounded-xl shadow-sm">
      <p class="text-gray-500 text-sm">Today's Revenue</p>
      <p class="text-3xl font-semibold mt-1">${revenueToday.toFixed(2)}</p>
      <p class="text-green-500 text-sm mt-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span class="ml-1">8% from yesterday</span>
      </p>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="mb-8">
    <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
    <div class="grid grid-cols-2 gap-4">
      <a href="/vendor-dashboard/menu" class="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
        <div class="bg-blue-100 p-3 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <span>Add Menu Item</span>
      </a>
      <a href="/vendor-dashboard/orders" class="bg-white p-4 rounded-xl shadow-sm flex items-center space-x-3">
        <div class="bg-green-100 p-3 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <span>View Orders</span>
      </a>
    </div>
  </div>

  <!-- Recent Activity -->
  <div>
    <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="divide-y divide-gray-100">
        <!-- Activity Item 1 -->
        <div class="p-4 flex items-start space-x-3">
          <div class="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="font-medium">New order received</p>
            <p class="text-gray-500 text-sm">Order #4251 - 2 Wicked Wings, 1 Cola</p>
            <p class="text-gray-400 text-xs mt-1">2 minutes ago</p>
          </div>
        </div>
        
        <!-- Activity Item 2 -->
        <div class="p-4 flex items-start space-x-3">
          <div class="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="font-medium">Order completed</p>
            <p class="text-gray-500 text-sm">Order #4249 - 1 Snack Plate</p>
            <p class="text-gray-400 text-xs mt-1">25 minutes ago</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style global>
  :global(body) {
    font-family: 'Segoe UI', sans-serif;
  }

  @media (max-width: 600px) {
    :global(h1) {
      font-size: 1.5rem;
    }

    :global(p) {
      font-size: 1rem;
    }

    :global(a) {
      width: 100%;
    }
  }
</style>