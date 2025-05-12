<!-- src/features/events/components/EventProgram.svelte -->
<script lang="ts">
    import type { Event } from '../types';
    import type { Vendor } from '$features/adminDashboard/types/vendorTypes';
    import { onMount } from 'svelte';
    import { getVendorsForEvent } from '$features/adminDashboard/services/crudVendor';
    
    export let event: Event;
    
    let vendors: Vendor[] = [];
    let isLoading = false;

    onMount(async () => {
        isLoading = true;
        try {
            vendors = await getVendorsForEvent(event.id);
        } catch (error) {
            console.error('Failed to load vendors', error);
        } finally {
            isLoading = false;
        }
    });
</script>

<!-- Vendors Section -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-sky-900 mb-4">Event Vendors</h2>
    
    {#if isLoading}
        <div class="text-center py-8">
            <p>Loading vendors...</p>
        </div>
    {:else if vendors.length === 0}
        <div class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v3a4 4 0 008 0V7m-8 4h8m-8 4h8m4-12a4 4 0 00-8 0v1h8V3z" />
            </svg>
            <h3 class="mt-2 text-lg font-medium text-gray-900">No vendors yet</h3>
        </div>
    {:else}
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            {#each vendors as vendor}
                <div class="bg-slate-50 rounded-xl p-4">
                    {#if vendor.image_url}
                        <img src={vendor.image_url} alt={vendor.business_name} class="w-full h-32 object-cover rounded-lg mb-3" />
                    {/if}
                    <h3 class="font-medium text-sky-900">{vendor.business_name}</h3>
                    {#if vendor.description}
                        <p class="text-sm text-slate-500 mt-1 line-clamp-2">{vendor.description}</p>
                    {/if}
                    {#if vendor.categories?.length}
                        <div class="mt-2 flex flex-wrap gap-1">
                            {#each vendor.categories as category}
                                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {category}
                                </span>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>