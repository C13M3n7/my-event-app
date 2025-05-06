<!-- src/features/vendorDashboard/components/MetricCard.svelte -->
<script lang="ts">
    export let title: string;
    export let value: string;
    export let change: string;
    export let icon: string;
  </script>
  
  <div class="bg-white rounded-lg shadow p-4 h-full">
    <div class="flex justify-between">
      <div>
        <p class="text-sm text-gray-500">{title}</p>
        <p class="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div class="text-3xl">{icon}</div>
    </div>
    <div class="mt-4">
      <span class:bg-green-100={change.startsWith('+')} 
            class:bg-red-100={change.startsWith('-')}
            class:text-green-800={change.startsWith('+')}
            class:text-red-800={change.startsWith('-')}
            class="px-2 py-1 rounded-full text-xs font-medium">
        {change}
      </span>
      <span class="text-xs text-gray-500 ml-1">vs last period</span>
    </div>
  </div>