<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import '../app.css';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	// List of paths where nav should be hidden
	const noNavPaths = [
		'/cart',
		'/fnb-menu',
		'/payment-confirmation', 
		'/checkout'
	];

	// Derived store to check if nav should be shown
	const showNav = derived(page, ($page) => {
		return !noNavPaths.some(path => $page.url.pathname.startsWith(path));
	});
</script>

{#if $showNav}
	<Nav />
{/if}

<slot />
