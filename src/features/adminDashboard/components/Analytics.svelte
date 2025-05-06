<script>
  import { onMount } from 'svelte';
  import Chart from './Chart.svelte'; // Import your Chart component

  let showPopup = false;
  let selectedEvent = null;
  let isClient = false; // Flag to track client-side rendering

  const events = [
    {
      name: "Harvest Event",
      type: "F&B",
      date: "12/4/2025 - 16/4/2025",
      details: "An event celebrating local harvest with food stalls and music.",
      ageData: { "1-8": 20, "9-15": 30, "16-25": 15 },
      cumulativeSales: [
        { date: "12/4/2025", sales: 1000 },
        { date: "13/4/2025", sales: 1500 },
        { date: "14/4/2025", sales: 1200 },
        { date: "15/4/2025", sales: 2000 },
        { date: "16/4/2025", sales: 1800 }
      ],
      adminData: { "Total Attendees": 65, "Total Revenue": 5000 }
    },
    {
      name: "Taylor Swift: The Eras Tour",
      type: "Concert",
      date: "21/4/2025 - 23/4/2025",
      details: "World tour featuring all Taylor Swift's music eras.",
      ageData: { "1-8": 10, "9-15": 50, "16-25": 70 },
      cumulativeSales: [
        { date: "21/4/2025", sales: 3000 },
        { date: "22/4/2025", sales: 2700 },
        { date: "23/4/2025", sales: 4000 }
      ],
      adminData: { "Total Attendees": 130, "Total Revenue": 20000 }
    }
  ];

  function showDetails(event) {
    selectedEvent = event;
    showPopup = true;
  }

  function closePopup() {
    showPopup = false;
  }

  function exportCSV() {
    const age = selectedEvent.ageData;
    const admin = selectedEvent.adminData;
    let csv = "Chart,Category,Value\n";
  
    for (const [group, value] of Object.entries(age)) {
      csv += `Age Distribution,${group},${value}\n`;
    }
  
    for (const [label, value] of Object.entries(admin)) {
      csv += `Admin Data,${label},${value}\n`;
    }
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedEvent?.name?.replace(/\s+/g, "_") || "default"}_analytics.csv`;
    link.click();
  }

  onMount(() => {
    isClient = true;
  });
</script>

<!-- Updated Tailwind CSS Styles for Vertical Layout -->
<div class="header p-4">
  <h1 class="text-2xl font-normal text-left">Analytics</h1>
</div>

<div class="container mx-auto p-4 sm:max-w-full lg:max-w-screen-lg">
  {#each events as event}
    <div class="event-card border p-4 mb-4 rounded-lg bg-gray-100 shadow-sm flex flex-col gap-4">
      <div class="event-column flex-1 text-xl font-semibold">{event.name}</div>
      <div class="event-column flex-1">{event.type}</div>
      <div class="event-column flex-1">{event.date}</div>
      <div class="event-column flex-1">
        <button class="details-button bg-blue-500 text-white py-2 px-4 rounded-lg text-sm cursor-pointer w-full sm:w-auto" on:click={() => showDetails(event)}>
          Details
      </div>
    </div>
  {/each}
</div>

{#if showPopup}
  <dialog class="popup fixed inset-0 z-50 bg-opacity-50 flex justify-center items-center" open aria-modal="true" tabindex="0">
    <div class="popup-content bg-white p-8 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto" role="dialog" on:click|stopPropagation on:keydown={(e) => e.key === 'Escape' && closePopup()} aria-label="Popup Content">
      <div class="popup-header text-xl font-bold mb-4">{selectedEvent.name}</div>

      <!-- Cumulative Sales Chart (direct integration) -->
      {#if selectedEvent && isClient}
        <Chart {selectedEvent} chartType="line" />
      {/if}

      <!-- Age Distribution (Horizontal Bar Chart) -->
      {#if selectedEvent && isClient}
        <Chart {selectedEvent} chartType="bar" />
      {/if}


      <!-- Admin Data Display -->
      <div class="mt-6">
        <h4 class="text-lg font-semibold">Admin Data</h4>
        <p><strong>Total Attendees:</strong> {selectedEvent.adminData["Total Attendees"]}</p>
        <p><strong>Total Revenue:</strong> RM{selectedEvent.adminData["Total Revenue"]}</p>
      </div>

    <div class="popup-buttons flex justify-end gap-4 mt-4">
            <button class="export-btn bg-green-500 text-white py-2 px-4 rounded-lg" on:click={exportCSV}>Export CSV</button>
            <button class="close-btn bg-gray-300 text-gray-700 py-2 px-4 rounded-lg" on:click={closePopup}>Close</button>
    </div>
  </dialog>
{/if}
