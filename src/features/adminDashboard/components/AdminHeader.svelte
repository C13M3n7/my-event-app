<!-- src\features\adminDashboard\components\AdminHeader.svelte -->
<script>
    import { onMount } from 'svelte';
    import { auth, logout } from '$lib/firebase';
  
    let user = null;
    let menuOpen = false;
  
    onMount(() => {
      const unsubscribe = auth.onAuthStateChanged((u) => {
        user = u;
      });
      return () => unsubscribe();
    });
  
    const handleLogout = async () => {
      try {
        await logout();
        menuOpen = false;
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
  
    const toggleMenu = () => {
      menuOpen = !menuOpen;
    };
  
    const links = [
      { name: 'Overview', path: '/admin-dashboard' },
      { name: 'Event Management', path: '/admin-dashboard/events' },
      { name: 'User Management', path: '/admin-dashboard/users' },
      { name: 'Analytics', path: '/admin-dashboard/analytics' },
    ];
  </script>
  
  <nav class="flex items-center justify-between p-4 bg-white shadow-md relative z-50">
   
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2">
      <img src="/images/city_services_logo.jpg" alt="Logo" class="h-10 md:h-12 rounded-full" />
      <span class="text-lg font-semibold text-gray-800">City Services</span>
    </a>
  
    <button class="md:hidden focus:outline-none" on:click={toggleMenu} aria-label="Toggle menu" aria-expanded={menuOpen}>
      <div class="w-6 flex flex-col gap-1.5">
        <div class={`h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
        <div class={`h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
        <div class={`h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
      </div>
    </button>
  
    <!-- Desktop nav -->
    <div class="hidden md:flex gap-6">
      {#each links as link}
        <a href={link.path} class="text-gray-700 hover:text-green-600 transition flex items-center gap-1">
          <span class="icon">{link.icon}</span>
          <span>{link.name}</span>
        </a>
      {/each}
  
    </div>
  
    <!-- Mobile nav -->
    <div class={`md:hidden absolute top-full left-0 right-0 bg-white p-4 shadow-md transition-all duration-300 ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
      {#each links as link}
        <a href={link.path} class="text-gray-700 hover:text-green-600 transition py-2 flex items-center gap-1" on:click={toggleMenu}>
          <span class="icon">{link.icon}</span>
          <span>{link.name}</span>
        </a>
      {/each}
    </div>
  </nav>
  