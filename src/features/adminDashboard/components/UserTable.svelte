<script>
    export let showAddUserModal = false;
    export let handleAddUserClick;
    export let closeAddUserModal;
  
    export let users = [
      { id: 1, email: "jane.doe.verylongemailaddress@gmail.com", role: "Admin" },
      { id: 2, email: "johnsmith@someemail.com", role: "Editor" },
      { id: 3, email: "alice.johnson@longproviderdomain.com", role: "User" }
    ];
  
    const roleOptions = [
      "Super Admin",
      "Support Admin",
      "Event Organiser",
      "Remove Role"
    ];
  
    let editingUserId = null;
    let selectedRole = null;
  
    function openRoleModal(userId) {
      editingUserId = userId;
      const user = users.find(u => u.id === userId);
      selectedRole = user?.role ?? null;
    }
  
    function confirmRoleChange() {
      const userIndex = users.findIndex(u => u.id === editingUserId);
      if (userIndex !== -1) {
        users[userIndex].role = selectedRole === "Remove Role" ? null : selectedRole;
      }
      closeRoleModal();
    }
  
    function closeRoleModal() {
      editingUserId = null;
      selectedRole = null;
    }
  
    let newUserEmail = "";
    let newUserRole = roleOptions[0];
  
    function addNewUser() {
      if (newUserEmail.trim() !== "") {
        users = [
          ...users,
          {
            id: Math.max(0, ...users.map(u => u.id)) + 1,
            email: newUserEmail,
            role: newUserRole === "Remove Role" ? null : newUserRole
          }
        ];
  
        newUserEmail = "";
        newUserRole = roleOptions[0];
  
        closeAddUserModal();
      }
    }
  </script>
  
  <!-- User Table -->
  <div class="overflow-x-auto">
    <table class="min-w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
        </tr>
      </thead>
      <tbody>
        {#each users as user (user.id)}
          <tr class="border-t border-gray-200 hover:bg-gray-50">
            <td class="py-3 px-4 text-sm text-gray-800 max-w-[180px] md:max-w-none whitespace-nowrap overflow-hidden text-ellipsis" title={user.email}>
              <div class="flex items-center gap-2">
                <button
                  class="text-gray-500 hover:text-gray-700"
                  on:click={() => openRoleModal(user.id)}
                  aria-label="Edit Role"
                >
                  ✏️
                </button>
                <span class="truncate">{user.email}</span>
              </div>
            </td>
            <td class="py-3 px-4 text-sm text-gray-800">
              {user.role ?? "-"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <!-- Add New User Modal -->
  {#if showAddUserModal}
    <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40" on:click={closeAddUserModal}></div>
  
    <div class="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl p-4 shadow-2xl">
      <h2 class="text-lg font-semibold mb-4 text-center">Add New User</h2>
  
      <div class="space-y-4">
        <input
          type="email"
          placeholder="Enter email"
          bind:value={newUserEmail}
          class="w-full border px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
  
        <div class="space-y-2">
          {#each roleOptions as role}
            <label class="flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-100">
              <input
                type="radio"
                name="newRole"
                value={role}
                bind:group={newUserRole}
                class="form-radio text-blue-600"
              />
              <span class="text-sm">{role}</span>
            </label>
          {/each}
        </div>
      </div>
  
      <div class="mt-6 flex justify-between gap-4">
        <button
          class="flex-1 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          on:click={closeAddUserModal}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 rounded-lg text-white"
          style="background-color: #00bd7d;"
          on:click={addNewUser}
        >
          Add
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Edit Role Modal -->
  {#if editingUserId !== null}
    <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40" on:click={closeRoleModal}></div>
  
    <div class="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl p-4 shadow-2xl">
      <h2 class="text-lg font-semibold mb-4 text-center">Edit User Role</h2>
  
      <div class="space-y-2">
        {#each roleOptions as role}
          <label class="flex items-center gap-3 px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-100">
            <input
              type="radio"
              name="role"
              value={role}
              bind:group={selectedRole}
              class="form-radio text-blue-600"
            />
            <span class="text-sm">{role}</span>
          </label>
        {/each}
      </div>
  
      <div class="mt-6 flex justify-between gap-4">
        <button
          class="flex-1 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          on:click={closeRoleModal}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 rounded-lg text-white"
          style="background-color: #00bd7d;"
          on:click={confirmRoleChange}
        >
          Confirm
        </button>
      </div>
    </div>
  {/if}
  
  <style>
    input[type="radio"]:checked {
      accent-color: #024a72; /* Applies your dark blue when selected */
    }
  </style>
  