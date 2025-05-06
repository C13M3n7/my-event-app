<!-- Sales & Earnings -->
<!-- src/routes/vendor-dashboard/earnings/+page.svelte -->
<script lang="ts">
    import SalesChart from '$features/vendorDashboard/components/SalesChart.svelte';
    import MetricCard from '$features/vendorDashboard/components/MetricCard.svelte';
    import { onMount } from 'svelte';
  
    // Sample data - replace with real data from your API
    let salesData = [];
    let isLoading = true;
  
    // Generate sample data
    function generateSalesData() {
      const now = new Date();
      const data = [];
      
      // Daily data
      if (period === 'day') {
        for (let i = 0; i < 24; i++) {
          const date = new Date(now);
          date.setHours(i, 0, 0, 0);
          data.push({
            date: date.toISOString(),
            amount: Math.random() * 500 + 100 // RM100-RM600
          });
        }
      } 
      // Weekly data
      else if (period === 'week') {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toISOString(),
            amount: Math.random() * 3000 + 500 // RM500-RM3500
          });
        }
      } 
      // Monthly data
      else {
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 0; i < daysInMonth; i++) {
          const date = new Date(now);
          date.setDate(i + 1);
          data.push({
            date: date.toISOString(),
            amount: Math.random() * 2000 + 300 // RM300-RM2300
          });
        }
      }
      
      return data;
    }
  
    let period: 'day' | 'week' | 'month' = 'week';
    $: salesData = generateSalesData();
  
    // Calculate metrics
    $: totalSales = salesData.reduce((sum, item) => sum + item.amount, 0);
    $: averageSale = salesData.length > 0 ? totalSales / salesData.length : 0;
    $: peakSales = Math.max(...salesData.map(item => item.amount));
    $: ordersCount = Math.floor(totalSales / 15); // Approximate orders
  
    onMount(() => {
      // Simulate API load
      setTimeout(() => {
        isLoading = false;
      }, 800);
    });
  </script>
  
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">Sales & Earnings</h1>
  
    {#if isLoading}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {#each { length: 4 } as _}
          <div class="bg-white rounded-lg shadow p-4 h-32 animate-pulse"></div>
        {/each}
      </div>
      <div class="bg-white rounded-lg shadow p-4 h-96 animate-pulse"></div>
    {:else}
      <!-- Metrics Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Total Sales" 
          value={`RM${totalSales.toFixed(2)}`} 
          change="+12.5%" 
          icon="💰"
        />
        <MetricCard 
          title="Average Sale" 
          value={`RM${averageSale.toFixed(2)}`} 
          change="+3.2%" 
          icon="📊"
        />
        <MetricCard 
          title="Peak Sales" 
          value={`RM${peakSales.toFixed(2)}`} 
          change="+8.7%" 
          icon="🚀"
        />
        <MetricCard 
          title="Total Orders" 
          value={ordersCount.toString()} 
          change="+5.1%" 
          icon="🛒"
        />
      </div>
  
      <!-- Sales Chart -->
      <SalesChart {salesData} {period} title="Sales Performance" />
  
      <!-- Recent Transactions -->
      <div class="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-medium">Recent Transactions</h3>
        </div>
        <div class="divide-y divide-gray-200">
          {#each salesData.slice(0, 5) as transaction (transaction.date)}
            <div class="p-4 flex justify-between items-center">
              <div>
                <p class="font-medium">
                  {new Date(transaction.date).toLocaleDateString([], { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p class="text-sm text-gray-500">Order #{Math.floor(Math.random() * 1000)}</p>
              </div>
              <div class="text-right">
                <p class="font-medium">RM{transaction.amount.toFixed(2)}</p>
                <p class="text-sm text-green-500">Completed</p>
              </div>
            </div>
          {/each}
        </div>
        <div class="p-4 border-t border-gray-200 text-center">
          <a href="/vendor-dashboard/orders" class="text-blue-500 hover:underline">
            View all transactions
          </a>
        </div>
      </div>
    {/if}
  </div>