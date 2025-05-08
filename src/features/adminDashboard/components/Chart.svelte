<script>
  // =============================
  // Props
  // =============================
  export let event;  // The selected event's data
  export let chartType; // "line" or "bar"

  // =============================
  // Imports
  // =============================
  import { onMount, afterUpdate } from 'svelte';
  import {
    Chart,
    LineController,
    BarController,
    LineElement,
    BarElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
  } from 'chart.js';

  // =============================
  // Register Chart.js Components
  // =============================
  Chart.register(
    LineController,
    BarController,
    LineElement,
    BarElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend
  );

  // =============================
  // Variables
  // =============================
  let chartInstance;
  let canvas;

  // =============================
  // Lifecycle: onMount
  // =============================
  onMount(() => {
    return () => {
      // Cleanup chart on unmount
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  });

  // =============================
  // Lifecycle: afterUpdate
  // =============================
  afterUpdate(() => {
    if (!event || !chartType) return;
    
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Destroy previous instance
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Create new chart
    chartInstance = new Chart(ctx, getChartConfig());
  });

  // =============================
  // Chart Config Generator
  // =============================
  function getChartConfig() {
    if (chartType === "line") {
      return {
        type: 'line',
        data: {
          labels: event.cumulativeSales.map(sale => sale.date),
          datasets: [{
            label: 'Cumulative Sales',
            data: event.cumulativeSales.map(sale => sale.sales),
            borderColor: '#3490dc',
            tension: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'By day' }},
            y: { title: { display: true, text: 'Sales' }}
          }
        }
      };
    } else if (chartType === "bar") {
      return {
        type: 'bar',
        data: {
          labels: Object.keys(event.ageData),
          datasets: [{
            label: 'Attendees',
            data: Object.values(event.ageData),
            backgroundColor: [
              '#F87171', '#34D399', '#60A5FA', 
              '#FBBF24', '#A78BFA', '#F59E0B'
            ],
            borderColor: 'white',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Age Group' }},
            y: { title: { display: true, text: 'Count' }, beginAtZero: true }
          }
        }
      };
    }
    return null;
  }
</script>

<div class="bg-white p-6 rounded-lg shadow-lg w-full">
  <h3 class="text-xl font-semibold mb-4 text-center text-gray-800">
    {chartType === 'line' ? 'Cumulative Sales' : 'Age Distribution'}
  </h3>
  <div class="relative h-80 w-full"> <!-- Fixed height container -->
    <canvas bind:this={canvas}></canvas>
  </div>
</div>