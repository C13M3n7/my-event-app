<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { getFunctions, httpsCallable } from 'firebase/functions';

  onMount(async () => {
    try {
      const verifyAdmin = httpsCallable<unknown, { isAdmin: boolean }>(
        getFunctions(),
        'verifyAdmin'
      );
      const { data } = await verifyAdmin();
      
      if (data.isAdmin) {
        goto('/admin-dashboard');
      } else {
        toast.error('Admin privileges required');
        goto('/');
      }
    } catch (error) {
      toast.error('Verification failed');
      goto('/auth/login');
    }
  });
</script>

<div class="text-center p-8">
  <p>Verifying admin access...</p>
</div>