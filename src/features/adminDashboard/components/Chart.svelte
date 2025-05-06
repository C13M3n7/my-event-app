<script>
  export let selectedEvent; // Selected event passed from parent
  export let chartType; // To determine which chart to render (line, bar, etc.)

  let chartData = null;
  let chartConfig = null;
  let chartInstance;
  let canvas; // Ref to hold canvas element

  import { onMount, afterUpdate } from 'svelte';
  import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, ArcElement, LineController, PointElement, BarController } from 'chart.js';

  // Registering required components in Chart.js
  Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    ArcElement,
    LineController,
    PointElement,
    BarController
  );

  // Prepare chart data and config based on chartType (line, bar, etc.)
  onMount(() => {
    if (chartType === "line") {
      chartData = {
        labels: selectedEvent.cumulativeSales.map(sale => sale.date),
        datasets: [{
          label: 'Cumulative Sales',
          data: selectedEvent.cumulativeSales.map(sale => sale.sales),
          fill: false,
          borderColor: '#3490dc', // Custom blue color for line
          tension: 0,  // Remove smoothing for a spiky line
        }]
      };
      chartConfig = {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: 'By day' }},
            y: { title: { display: true, text: 'Sales' }}
          },
          plugins: {
            title: { display: false },  // Hide the title
            legend: { display: false }  // Hide the legend (optional)
          }
        }
      };
    } else if (chartType === "bar") {
      chartData = {
        labels: Object.keys(selectedEvent.ageData),
        datasets: [{
          label: 'Attendee Age',
          data: Object.values(selectedEvent.ageData),
          backgroundColor: [
            '#F87171', // Tailwind red-400
            '#34D399', // Tailwind green-400
            '#60A5FA', // Tailwind blue-400
            '#FBBF24', // Tailwind yellow-400
            '#A78BFA', // Tailwind purple-400
            '#F59E0B'  // Tailwind amber-400
          ],
          borderColor: 'white',
          borderWidth: 2
        }]
      };
      chartConfig = {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: 'Age Group' }},
            y: { title: { display: true, text: 'Count' }, beginAtZero: true }
          },
          plugins: {
            title: { display: false },  // Hide the title
            legend: { display: false }  // Hide the legend (optional)
          }
        }
      };
    }
  });

  // Ensure the canvas is available before trying to initialize the chart
  afterUpdate(() => {
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (chartConfig && ctx) {
        if (chartInstance) {
          chartInstance.destroy(); // Destroy previous chart instance if it exists
        }
        chartInstance = new Chart(ctx, chartConfig); // Create new chart instance
      }
    }
  });
</script>

{#if chartConfig}
  <div class="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-8">
    <!-- Heading Above the Chart -->
    <h3 class="text-2xl font-semibold mb-6 text-center text-gray-800">
      {#if chartType === 'line'}
        Cumulative Sales Over Time
      {:else if chartType === 'bar'}
        Age Distribution of Attendees
      {/if}
    </h3>
    
    <!-- Canvas -->
    <canvas bind:this={canvas} class="w-full h-[400px]"></canvas> <!-- Using Tailwind for width and height -->
  </div>
{/if}
