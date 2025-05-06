<script>
    import UserTable from '$features/adminDashboard/components/UserTable.svelte';
</script>
  
  <!-- Container for admin dashboard -->
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
  
    <!-- Desktop & Tablet View -->
    <div class="hidden md:block">
      <div class="bg-white rounded-2xl shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-700">All Users</h2>
        <UserTable />
      </div>
    </div>
  
    <!-- Mobile View -->
    <div class="block md:hidden">
      <div class="bg-white rounded-2xl shadow-md p-4">
        <h2 class="text-lg font-semibold mb-3 text-gray-700">Users</h2>
        <p class="text-sm text-gray-500 mb-2">
          Swipe right to see full table or rotate your phone for a better view.
        </p>
        <div class="overflow-x-auto">
          <UserTable />
        </div>
      </div>
    </div>
  </div>
  