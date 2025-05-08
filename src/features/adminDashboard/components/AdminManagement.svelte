<script lang="ts">
  import { getFunctions, httpsCallable } from 'firebase/functions';
  import { getAuth } from 'firebase/auth';
  import { toast } from 'svelte-sonner';
  import type { HttpsCallableResult } from 'firebase/functions';

  // Types
  type AdminResponse = {
    success: boolean;
    message: string;
    uid?: string;
    error?: string; // Added error property
  };

  // State
  let adminEmail = '';
  let loading = false;

  // Cloud functions
  const functions = getFunctions();
  const createAdmin = httpsCallable<{ email: string }, AdminResponse>(functions, 'createAdminUser');

  async function handleCreateAdmin() {
  if (!adminEmail) return;
  
  try {
    loading = true;
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) throw new Error('User not authenticated');

    // Force token refresh
    const token = await user.getIdToken(true);
    const tokenResult = await user.getIdTokenResult();
    
    if (!tokenResult.claims.admin) {
      throw new Error('Admin privileges not found');
    }

    const result = await createAdmin({ email: adminEmail });

    if (result.data.success) {
      toast.success(result.data.message);
      adminEmail = '';
    } else {
      toast.error(result.data.error || 'Failed to create admin');
    }
  } catch (error) {
    const err = error as Error;
    toast.error('Failed to create admin: ' + err.message);
  } finally {
    loading = false;
  }
}
</script>

<div class="p-4 sm:p-6 max-w-6xl mx-auto">
  <h1 class="mt-4 text-3xl font-light text-gray-900">Admin Management</h1>
  
  <!-- Add Admin Form -->
  <div class="bg-blue-50 p-4 rounded-lg mt-4">
    <h3 class="font-medium text-blue-800 mb-3">Add New Admin</h3>
    <div class="flex gap-2">
      <input
        bind:value={adminEmail}
        type="email"
        placeholder="Enter user email"
        class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        on:click={handleCreateAdmin}
        disabled={loading}
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Grant Admin'}
      </button>
    </div>
  </div>
</div>