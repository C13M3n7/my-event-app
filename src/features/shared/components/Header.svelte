<script>
  import { auth, logout } from '$lib/firebase';
  import { onMount } from 'svelte';

  let user = null;
  let menuOpen = false;

  let showNotificationDropdown = false; // Controls the notification dropdown visibility
  let userType = 'user'; // Set this to 'user' or 'vendor' based on the context (can be dynamic in your app)

  
  // User-specific notifications
  let userNotifications = [
    { id: 1, message: "Order completed! Order with ID#010321 has been delivered to your table.", time: "Mar 06, 2025", unread: true },
    { id: 2, message: "Harvest Fusion Festival - Join the urban Gawai destination now! Experience unity through arts, music, culinary and culture.", time: "Feb 28, 2025", unread: true },
    { id: 3, message: "Complete your profile today! Get personalized vouchers, deals & news just for you! Update your profile now.", time: "Feb 20, 2025", unread: true },
    { id: 4, message: "Your table is ready! Please proceed to Table 8. Enjoy your meal!", time: "Feb 10, 2025", unread: false }
  ];

  // Vendor-specific notifications
  let vendorNotifications = [
    { id: 101, message: "New Order Received! Order #A1021 has been placed by a customer.", time: "Apr 24, 2025", unread: true },
    { id: 102, message: "Order Delivered - Order #A1020 has been marked as delivered.", time: "Apr 23, 2025", unread: false },
    { id: 103, message: "Vendor Profile Updated! Your profile details have been successfully updated.", time: "Apr 22, 2025", unread: false },
    { id: 104, message: "Order Moved to Preparing - Order #A1019 has been moved back to 'Preparing Orders'.", time: "Apr 21, 2025", unread: true }
  ];

  // Function to get notifications based on the userType (user or vendor)
  let notifications = userType === 'user' ? userNotifications : vendorNotifications;

  // Get unread notifications count
  let unreadCount = notifications.filter(n => n.unread).length;

  onMount(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      user = u;
    });

    return () => unsubscribe();
  });

  // Toggle the notification dropdown visibility
    const toggleNotificationDropdown = () => {
    showNotificationDropdown = !showNotificationDropdown;
  };


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

  const markAsRead = () => {
    notifications = notifications.map(n => ({...n, unread: false}));
    unreadCount = 0;
  };
</script>

<nav class="flex items-center justify-between p-4 bg-white shadow-md relative z-50">
  <!-- Logo -->
  <a href="/" class="flex items-center gap-2">
    <img src="/images/city_services_logo.jpg" alt="Logo" class="h-10 md:h-12 rounded-full" />
    <span class="text-lg font-semibold text-gray-800">City Services</span>
  </a>

  <!-- Hamburger Button (mobile only) -->
  <button
    class="md:hidden focus:outline-none"
    on:click={toggleMenu}
    aria-label="Toggle menu"
    aria-expanded={menuOpen}
  >
    <div class="w-6 flex flex-col gap-1.5">
      <div class={`h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
      <div class={`h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
      <div class={`h-0.5 bg-gray-700 rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
    </div>
  </button>

  <!-- Desktop Nav -->
  <div class="hidden md:flex gap-6 items-center">
    <!-- Existing links... -->
    <a href="/about" class="text-gray-700 hover:text-blue-500 transition">About</a>
    <a href="/events" class="text-gray-700 hover:text-blue-500 transition">Events</a>
    <a href="/E-order" class="text-gray-700 hover:text-blue-500 transition">E-order</a>

    {#if user}
      <!-- Notification Bell for Desktop -->
      <div class="relative">
        <div class="flex items-center">
          <a href="/profile/notifications" class="text-m mr-1">
            🔔
          </a>
          <button 
            class="absolute inset-0 w-6 h-6 opacity-0" 
            on:click|preventDefault={toggleNotificationDropdown}
            aria-label="Toggle notifications"
          >
          </button>
          {#if unreadCount > 0}
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          {/if}
        </div>
        
        {#if showNotificationDropdown}
          <div class="absolute top-8 right-0 bg-white shadow-lg rounded-md w-80 p-4 z-50">
            <div class="flex justify-between items-center">
              <h3 class="font-semibold text-lg">Notifications</h3>
              <button on:click={markAsRead} class="text-blue-500 text-sm">Mark all as read</button>
            </div>
            <ul class="space-y-2 mt-2 max-h-60 overflow-y-auto">
              {#each notifications as notification}
                <li class="text-sm p-2 rounded {notification.unread ? 'bg-blue-50' : ''}">
                  <p>{notification.message}</p>
                  <span class="text-xs text-gray-400">{notification.time}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <a href="/profile" class="text-gray-700 hover:text-blue-500 transition">Profile</a>
      <button on:click={handleLogout} class="text-gray-700 hover:text-blue-500 transition">Logout</button>
    {:else}
      <a href="/auth/login" class="text-gray-700 hover:text-blue-500 transition">Login</a>
    {/if}
  </div>

  <!-- Mobile Dropdown -->
  <div class={`md:hidden absolute top-full right-0 left-0 bg-white shadow-md p-4 flex flex-col gap-3 transition-all duration-300 ${
    menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
  }`}>
    <a href="/about" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>About</a>
    <a href="/events" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>Events</a>
    <a href="/E-order" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>E-order</a>

    {#if user}
      <!-- Notification Section for Mobile -->
      <div class="relative py-2">
        <div class="flex items-center justify-between">
          <a href="/profile/notifications" class="text-gray-700 hover:text-blue-500 transition flex items-center">
            🔔 Notifications
            {#if unreadCount > 0}
              <span class="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            {/if}
          </a>
          <button 
            on:click={toggleNotificationDropdown}
            class="text-gray-700 hover:text-blue-500 transition ml-2"
          >
            {#if showNotificationDropdown}
              ▲
            {:else}
              ▼
            {/if}
          </button>
        </div>
        
        {#if showNotificationDropdown}
          <div class="mt-2 bg-gray-50 rounded-md p-3">
            <ul class="space-y-3">
              {#each notifications as notification}
                <li class="text-sm p-2 rounded {notification.unread ? 'bg-blue-50' : ''}">
                  <p>{notification.message}</p>
                  <span class="text-xs text-gray-400">{notification.time}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <a href="/profile" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>Profile</a>
      <button on:click={handleLogout} class="text-gray-700 hover:text-blue-500 transition py-2 text-left">Logout</button>
    {:else}
      <a href="/auth/login" class="text-gray-700 hover:text-blue-500 transition py-2" on:click={toggleMenu}>Login</a>
    {/if}
  </div>
</nav>

<style>
  /* Add some custom styles for better mobile experience */
  @media (max-width: 767px) {
    .mobile-notification-item {
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }
</style>