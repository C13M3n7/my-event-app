<!-- src/routes/+layout.svelte -->

<script lang="ts">
  import Nav from '$features/shared/components/Header.svelte'; // Adjust path if needed
  import '../app.css';
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

  const noNavPaths = ['/cart', '/fnb-menu', '/fnb-payment', '/vendor-dashboard', '/admin-dashboard'];

  const showNav = derived(page, ($page) => {
    return !noNavPaths.some(path => $page.url.pathname.startsWith(path));
  });
</script>

{#if $showNav}
  <Nav />
{/if}

<slot />