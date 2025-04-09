<script>
  import { auth, logout } from '$lib/firebase';
  import { onMount } from 'svelte';
  
  let user = null;
  let unsubscribe;
  
  onMount(() => {
    unsubscribe = auth.onAuthStateChanged((u) => {
      user = u;
    });
    
    return () => unsubscribe();
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
</script>

<nav class="flex items-center justify-between p-4 bg-white shadow-md">
  <a href="/" class="flex items-center gap-2">
    <img src="/images/city_services_logo.jpg" alt="Logo" class="h-10 md:h-12 rounded-full" />
    <span class="text-lg font-semibold text-gray-800">City Services</span>
  </a>

  <div class="flex gap-4">
    <a href="/about" class="text-gray-700 hover:text-blue-500 transition">About</a>
    <a href="/events" class="text-gray-700 hover:text-blue-500 transition">Events</a>
    
    {#if $user}
      <a href="/profile" class="text-gray-700 hover:text-blue-500 transition">Profile</a>
      <button on:click={logout} class="text-gray-700 hover:text-blue-500 transition">Logout</button>
    {:else}
      <a href="/login" class="text-gray-700 hover:text-blue-500 transition">Login</a>
    {/if}
  </div>
</nav>