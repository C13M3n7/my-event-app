<script>
  import { auth, logout } from '$lib/firebase';
  import { onMount } from 'svelte';
  
  let user = null;
  let unsubscribe;
  let menuOpen = false;
  
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

  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<nav class="flex items-center justify-between p-4 bg-white shadow-md relative">
  <a href="/" class="flex items-center gap-2">
    <img src="/images/city_services_logo.jpg" alt="Logo" class="h-10 md:h-12 rounded-full" />
    <span class="text-lg font-semibold text-gray-800">City Services</span>
  </a>

  <!-- Hamburger Button (always visible) -->
  <button 
    class="focus:outline-none" 
    on:click={toggleMenu}
    aria-label="Toggle menu"
    aria-expanded={menuOpen}
  >
    <div class="w-6 flex flex-col gap-1.5">
      <div class={`h-0.5 bg-gray-700 rounded transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
      <div class={`h-0.5 bg-gray-700 rounded ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
      <div class={`h-0.5 bg-gray-700 rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
    </div>
  </button>

  <!-- Dropdown Menu -->
  <div class={`absolute top-full right-0 left-0 bg-white shadow-md p-4 flex flex-col gap-3 transition-all duration-300 z-50 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
    <a href="/about" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>About</a>
    <a href="/events" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>Events</a>
    <a href="/E-order" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>E-order</a>
    
    {#if $user}
      <a href="/profile" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>Profile</a>
      <button on:click={() => { logout(); toggleMenu(); }} class="text-gray-700 hover:text-blue-500 transition py-2 text-left">Logout</button>
    {:else}
      <a href="/login" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>Login</a>
    {/if}
  </div>
</nav>
