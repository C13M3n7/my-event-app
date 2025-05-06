<script>
    import UserTable from '$features/adminDashboard/components/UserTable.svelte'; // Import the UserTable component
  
    let showAddUserModal = false; // State to manage the visibility of the "Add User" modal
  
    // This function will trigger the modal in UserTable.svelte
    const handleAddUserClick = () => {
      showAddUserModal = true;  // Open the modal
    };
  
    // Function to close the modal from the parent component
    const closeAddUserModal = () => {
      showAddUserModal = false; // Close the modal
    };
  </script>
  
  <div class="container mx-auto p-4">
    <!-- User Management Title and Add User Button -->
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">User Management</h1>
      
      <!-- Add User Button -->
      <button
      class="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2"
      on:click={handleAddUserClick}
      style="background-color: #00bd7d;"
      >
      ➕ Add User
      </button>
  
    </div>
  
    <!-- Pass the 'showAddUserModal' state and 'closeAddUserModal' function to UserTable component -->
    <UserTable {showAddUserModal} {handleAddUserClick} {closeAddUserModal} />
  </div>