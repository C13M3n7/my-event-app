<script lang="ts">
  // =============================
  // Imports
  // =============================
  import { onMount } from 'svelte';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  import { auth } from '$lib/firebase';  
  import UserTable from '$features/adminDashboard/components/UserTable.svelte';
  import AdminManagement from '$features/adminDashboard/components/AdminManagement.svelte';
  import type { User } from '$features/adminDashboard/types/roleTypes';

  // =============================
  // State Variables
  // =============================
  let users: User[] = [];
  let loading = true;
  let error: string | null = null;
  let isAdmin: boolean = false;

  // =============================
  // Lifecycle: onMount
  // =============================
  onMount(async () => {
    try {
      const token = await auth.currentUser?.getIdTokenResult(true);
      isAdmin = !!token?.claims?.admin;

      // ---------------------------------------------
      // Step 2: Fetch all users from Firestore
      // ---------------------------------------------
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'users'));

      users = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email || '',
          role: data.admin ? 'Super Admin' : 'Non Admin',
          uid: data.uid || doc.id
        };
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      error = "Failed to load dashboard data";
    } finally {
      loading = false;
    }
  });
</script>

<!-- =============================
     UI: Error Message (if any)
============================= -->
{#if error}
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    {error}
  </div>
{/if}

<!-- Admin Management Component -->
  <!-- Add heading -->
  <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
   
  <AdminManagement />


<!-- =============================
     UI: User Table Component
============================= -->
<UserTable {users} {loading} {isAdmin} /> 
</div>