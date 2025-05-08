<script lang="ts">
  // =========================
  // Firebase & Dependencies
  // =========================
  import { app } from '$lib/firebase'; // Import the app instance
  import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
  import { httpsCallable } from 'firebase/functions';
  import { toast } from 'svelte-sonner';
  import type { User, RoleOption } from '../types/roleTypes';
  import type { FirebaseError } from 'firebase/app';
  import { auth } from '$lib/firebase';
  import { signOut } from 'firebase/auth';
  import { functions } from '$lib/firebase'; // Import the functions instance

  // =========================
  // Types
  // =========================
  type CreateAdminUserResponse = {
    success: boolean;
    message: string;
    uid: string;
    error?: string;
  };

  const manageAdminRole = httpsCallable<{
    targetEmail: string;
    targetUid: string;
    action: 'promote' | 'demote';
  }, {
    success: boolean;
    message: string;
    user: {
      email: string;
      newRole: string;
    };
  }>(functions, 'manageAdminRole');

  // =========================
  // Props & Reactive State
  // =========================
  export let users: User[];
  export let loading: boolean;
  export let isAdmin: boolean;
  
  const roleOptions: RoleOption[] = ["Super Admin", "Non Admin"];
  
  let editingUserId: string | null = null;
  let selectedRole: RoleOption = 'Non Admin';
  let showAddUserModal = false;
  let newUserEmail = '';

  let showConfirmationModal = false;
  let confirmationAction: 'promote' | 'demote' = 'promote'; // Initialize with default value
  let confirmationText = '';
  let userToModify: User | null = null;
  let inputConfirmation = '';

  // =========================
  // Firebase Functions
  // =========================


const createAdminUser = httpsCallable<{ email: string }, CreateAdminUserResponse>(
  functions, 
  'createAdminUser'
);

  // =========================
  // User Refresh
  // =========================
  async function refreshUsers() {
    loading = true;
    try {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'users'));
      users = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          email: docData.email || '',
          role: docData.admin ? 'Super Admin' : 'Non Admin',
          uid: docData.uid || doc.id
        };
      });
    } finally {
      loading = false;
    }
  }

  // =========================
  // Role Modal Functions
  // =========================
  function openRoleModal(userId: string) {
    if (!isAdmin) return;
    editingUserId = userId;
    const user = users.find(u => u.id === userId);
    if (user) selectedRole = user.role;
  }

  // Update confirmRoleChange to ensure confirmationAction is never null
  async function confirmRoleChange() {
    if (!isAdmin || !editingUserId || !selectedRole) return;
    
    const user = users.find(u => u.id === editingUserId);
    if (!user) return;

    userToModify = user;
    
    // Remove the null possibility by using else
    if (selectedRole === 'Super Admin') {
      confirmationAction = 'promote';
      confirmationText = `Confirm promoting ${user.email} to Super Admin`;
    } else {
      confirmationAction = 'demote';
      confirmationText = `Confirm demoting ${user.email} from Admin`;
    }
    
    showConfirmationModal = true;
    inputConfirmation = '';
  }

  async function executeRoleChange() {
  if (!userToModify) {
    toast.error('No user selected for modification');
    return;
  }

  const requiredText = confirmationAction === 'promote' ? 'PROMOTE' : 'DEMOTE';
  if (inputConfirmation.toUpperCase() !== requiredText) {
    toast.error(`Please type "${requiredText}" to confirm`);
    return;
  }

  try {
    // Force refresh the ID token and wait for it to complete
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
    } else {
      throw new Error('No authenticated user');
    }
    
    // Get fresh token for the callable function
    const token = await auth.currentUser.getIdToken();
    const result = await manageAdminRole({
      targetEmail: userToModify.email,
      targetUid: userToModify.uid,
      action: confirmationAction
    });

    if (result.data.success) {
      toast.success(result.data.message);
      await refreshUsers();
    } else {
      toast.error(result.data.message || 'Failed to update role');
    }
  } catch (error) {
    console.error("Role change failed:", error);
    
    const firebaseError = error as FirebaseError;
    if (firebaseError.code === 'unauthenticated') {
      toast.error('Session expired. Please log in again.');
      await signOut(auth);
      // Consider redirecting to login page here
    } else if (firebaseError.code === 'permission-denied') {
      toast.error('You need admin privileges for this action');
    } else {
      toast.error(firebaseError.message || 'Failed to update role');
    }
  } finally {
    closeConfirmationModal();
    closeRoleModal();
  }
}

  // Update checkAdminStatus to use the imported auth
  async function checkAdminStatus() {
    if (!auth.currentUser) return false;
    const token = await auth.currentUser.getIdTokenResult(true);
    return !!token.claims.admin;
  }

  function closeConfirmationModal() {
    showConfirmationModal = false;
    confirmationAction;
    userToModify = null;
    inputConfirmation = '';
  }

  function closeRoleModal() {
    editingUserId = null;
  }

  // =========================
  // Add User Modal Functions
  // =========================
  function openAddUserModal() {
    showAddUserModal = true;
  }

  function closeAddUserModal() {
    showAddUserModal = false;
    newUserEmail = '';
  }

  async function handleAddUser() {
    if (!newUserEmail.trim()) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      const result = await createAdminUser({ email: newUserEmail });
      
      if (result.data.success) {
        // Add to Firestore after successful Auth creation
        const db = getFirestore();
        await setDoc(doc(db, 'users', newUserEmail), {
          email: newUserEmail,
          admin: true,
          role: 'super-admin',
          uid: result.data.uid,
          createdAt: new Date().toISOString()
        });
        
        toast.success(result.data.message);
        await refreshUsers();
        closeAddUserModal();
      } else {
        toast.error(result.data.error || 'Failed to add admin');
      }
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to add user: ${err.message}`);
    } finally {
      loading = false;
    }
  }
</script>

<!-- Main Content -->
<div class="p-4 sm:p-6 max-w-6xl mx-auto">

  <!-- User Table -->
  <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if users.length === 0}
      <div class="text-center py-12 text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p class="mt-4 text-lg font-medium">No users found</p>
        {#if isAdmin}
          <p class="mt-1">Try adding a new admin user</p>
        {/if}
      </div>
    {:else}
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each users as user (user.id)}
            <tr class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  {#if isAdmin}
                    <button
                      on:click={() => openRoleModal(user.id)}
                      class="mr-3 text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                      aria-label={`Edit role for ${user.email}`}
                    >
                      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  {/if}
                  <div class="text-sm font-medium text-gray-900 truncate max-w-xs" title={user.email}>
                    {user.email}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  {user.role === 'Super Admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                  {user.role}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<!-- Add User Modal -->
{#if showAddUserModal}
  <div 
    role="dialog"
    aria-modal="true"
    aria-labelledby="add-user-title"
    class="fixed inset-0 z-40 flex items-center justify-center p-4"
    on:keydown={e => e.key === 'Escape' && closeAddUserModal()}
    tabindex="-1"
  >
    <!-- Modal Backdrop -->
    <button
      class="absolute inset-0 bg-black bg-opacity-50 w-full h-full cursor-default"
      on:click={closeAddUserModal}
      aria-label="Close modal"
    ></button>
    
    <!-- Modal Content -->
    <div 
      role="document"
      class="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10"
    >
      <div class="p-6">
        <h2 id="add-user-title" class="text-xl font-semibold text-gray-900 mb-4">Add New Admin</h2>
        <input
          type="email"
          bind:value={newUserEmail}
          placeholder="user@example.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <div class="mt-6 flex justify-end gap-3">
          <button 
            on:click={closeAddUserModal}
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button 
            on:click={handleAddUser}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Admin
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Role Modal -->
{#if editingUserId !== null}
  <div 
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-role-title"
    class="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4"
    on:keydown={e => e.key === 'Escape' && closeRoleModal()}
    tabindex="-1"
  >
    <!-- Modal Backdrop -->
    <button
      class="absolute inset-0 bg-black bg-opacity-50 w-full h-full cursor-default"
      on:click={closeRoleModal}
      aria-label="Close modal"
    ></button>
    
    <!-- Modal Content -->
    <div 
      class="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-md relative z-10"
    >
      <div class="p-6">
        <h2 id="edit-role-title" class="text-lg font-semibold text-gray-900 mb-4">Change User Role</h2>
        <div class="space-y-3">
          {#each roleOptions as role}
            <label class="flex items-center px-4 py-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="role"
                value={role}
                bind:group={selectedRole}
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span class="ml-3 block text-sm font-medium text-gray-700">{role}</span>
            </label>
          {/each}
        </div>
        <div class="mt-6 flex justify-between gap-3">
          <button
            on:click={closeRoleModal}
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            on:click={confirmRoleChange}
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Confirmation Modal -->
{#if showConfirmationModal && userToModify}
  <div 
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="confirmation-title"
    aria-describedby="confirmation-description"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    on:keydown={e => e.key === 'Escape' && closeConfirmationModal()}
    tabindex="-1"
  >
    <!-- Modal Backdrop -->
    <button
      class="absolute inset-0 bg-black bg-opacity-50 w-full h-full cursor-default"
      on:click={closeConfirmationModal}
      aria-label="Close modal"
    ></button>
    
    <!-- Modal Content -->
    <div 
      class="bg-white rounded-lg shadow-xl w-full max-w-md relative z-10"
    >
      <div class="p-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 id="confirmation-title" class="text-lg font-medium text-gray-900">
              {confirmationAction === 'promote' ? 'Promote to Admin' : 'Remove Admin Privileges'}
            </h3>
            <div id="confirmation-description" class="mt-2 text-sm text-gray-500">
              <p>{confirmationText}</p>
              <p class="mt-2 font-medium text-gray-700">Type "{confirmationAction === 'promote' ? 'PROMOTE' : 'DEMOTE'}" to confirm:</p>
            </div>
          </div>
        </div>
        
        <input
          type="text"
          bind:value={inputConfirmation}
          class="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm uppercase placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
          placeholder={confirmationAction === 'promote' ? 'PROMOTE' : 'DEMOTE'}
        />
        
        <div class="mt-6 flex justify-end gap-3">
          <button 
            on:click={closeConfirmationModal}
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button 
            on:click={executeRoleChange}
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}