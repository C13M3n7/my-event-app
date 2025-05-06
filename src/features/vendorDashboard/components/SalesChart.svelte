<!-- Visual sales analytics -->
 <!-- src/features/vendorDashboard/components/SalesChart.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import { colors } from '$features/shared/utils/chartStyles';
  
    export let salesData: { date: string; amount: number }[] = [];
    export let title: string = 'Sales Performance';
    export let period: 'day' | 'week' | 'month' = 'week';
  
    let chart: Chart;
    let canvas: HTMLCanvasElement;
  
    onMount(() => {
      Chart.register(...registerables);
      renderChart();
      
      return () => {
        if (chart) chart.destroy();
      };
    });
  
    function renderChart() {
      if (!canvas) return;
      
      const labels = salesData.map(item => {
        const date = new Date(item.date);
        if (period === 'day') {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (period === 'week') {
          return date.toLocaleDateString([], { weekday: 'short' });
        } else {
          return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
      });
  
      const data = salesData.map(item => item.amount);
  
      if (chart) chart.destroy();
  
      chart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Sales Amount',
            data,
            backgroundColor: colors.primary,
            borderColor: colors.primaryDark,
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `RM${context.raw?.toFixed(2)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `RM${value}`
              }
            }
          }
        }
      });
    }
  
    $: if (salesData && canvas) {
      renderChart();
    }
  </script>
  
  <div class="bg-white rounded-lg shadow p-4 h-full">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-medium text-lg">{title}</h3>
      <div class="flex space-x-2">
        <button 
          on:click={() => period = 'day'}
          class:bg-blue-100={period === 'day'}
          class:text-blue-800={period === 'day'}
          class="px-3 py-1 rounded-md text-sm"
        >
          Day
        </button>
        <button 
          on:click={() => period = 'week'}
          class:bg-blue-100={period === 'week'}
          class:text-blue-800={period === 'week'}
          class="px-3 py-1 rounded-md text-sm"
        >
          Week
        </button>
        <button 
          on:click={() => period = 'month'}
          class:bg-blue-100={period === 'month'}
          class:text-blue-800={period === 'month'}
          class="px-3 py-1 rounded-md text-sm"
        >
          Month
        </button>
      </div>
    </div>
    <div class="h-64">
      <canvas bind:this={canvas} />
    </div>
  </div>