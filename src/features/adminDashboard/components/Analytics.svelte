<script>
  // -----------------------------------------------
  // IMPORTS
  // -----------------------------------------------
  import { onMount } from 'svelte';
  import Chart from './Chart.svelte';

  // -----------------------------------------------
  // STATE & VARIABLES
  // -----------------------------------------------
  let showPopup = false;
  let selectedEvent = null;
  let isClient = false;

  // -----------------------------------------------
  // DUMMY EVENT DATA (can be fetched dynamically later)
  // -----------------------------------------------
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

  // -----------------------------------------------
  // FUNCTIONS
  // -----------------------------------------------
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

<!-- =============================================== -->
<!-- MAIN DASHBOARD LAYOUT -->
<!-- =============================================== -->
<div class="min-h-screen bg-gray-50">

  <!-- ===== HEADER ===== -->
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-light text-gray-900">Analytics Dashboard</h1>
    </div>
  </header>

  <!-- ===== MAIN CONTENT ===== -->
  <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    
    <!-- ---- Summary Cards ---- -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Total Events -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">Total Events</h3>
        <p class="mt-2 text-3xl font-light text-gray-900">{events.length}</p>
      </div>

      <!-- Total Revenue -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">Total Revenue</h3>
        <p class="mt-2 text-3xl font-light text-gray-900">
          RM{events.reduce((sum, event) => sum + event.adminData["Total Revenue"], 0).toLocaleString()}
        </p>
      </div>

      <!-- Total Attendees -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500">Total Attendees</h3>
        <p class="mt-2 text-3xl font-light text-gray-900">
          {events.reduce((sum, event) => sum + event.adminData["Total Attendees"], 0)}
        </p>
      </div>
    </div>

    <!-- ---- Event List Table ---- -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-5 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Event Analytics</h2>
      </div>
      <ul class="divide-y divide-gray-200">
        {#each events as event}
          <li class="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 min-w-0">
                <p class="text-lg font-medium text-gray-900 truncate">{event.name}</p>
                <p class="text-sm text-gray-500 mt-1 sm:mt-0">
                  {event.type} • {event.date}
                </p>
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-4">
                <button
                  on:click={() => showDetails(event)}
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  </main>

  <!-- =============================================== -->
  <!-- EVENT DETAILS MODAL (Popup) -->
  <!-- =============================================== -->
  {#if showPopup}
  <div
    class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    on:click={closePopup}
    tabindex="-1"
    aria-hidden="true"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="0"
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto focus:outline-none"
      on:click|stopPropagation
      on:keydown={(e) => e.key === 'Escape' && closePopup()}
    >
      <div class="p-6">
        <h2 id="modal-title" class="text-2xl font-light mb-4">{selectedEvent.name}</h2>

        <!-- ---- Charts ---- -->
        <div class="space-y-6">
          {#if isClient}
            <div class="bg-gray-50 p-4 rounded-lg">
              <Chart event={selectedEvent} chartType="line" />
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <Chart event={selectedEvent} chartType="bar" />
            </div>
          {/if}
        </div>

        <!-- ---- Event Info & Metrics ---- -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <!-- Event Details -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium mb-2">Event Details</h3>
            <p class="text-gray-600"><span class="font-medium">Type:</span> {selectedEvent.type}</p>
            <p class="text-gray-600"><span class="font-medium">Date:</span> {selectedEvent.date}</p>
            <p class="text-gray-600"><span class="font-medium">Details:</span> {selectedEvent.details}</p>
          </div>

          <!-- Metrics -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium mb-2">Metrics</h3>
            <p class="text-gray-600"><span class="font-medium">Attendees:</span> {selectedEvent.adminData["Total Attendees"]}</p>
            <p class="text-gray-600"><span class="font-medium">Revenue:</span> RM{selectedEvent.adminData["Total Revenue"]}</p>
          </div>
        </div>

        <!-- ---- Action Buttons ---- -->
        <div class="px-6 py-3 flex justify-end space-x-3">
          <button 
            on:click={exportCSV}
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Export CSV
          </button>
          <button 
            on:click={closePopup}
            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  {/if}
</div>
