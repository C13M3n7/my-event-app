<script lang="ts">
  import { onMount } from 'svelte';
  import VendorForm from './VendorForm.svelte';
  import { getVendorsForEvent, deleteVendor } from '../services/crudVendor';
  import { toast } from 'svelte-sonner';
  import type { Vendor } from '../types/vendorTypes';  
  import { deleteFile } from '$features/shared/services/storage';

  export let eventId: string;

  let vendors: Vendor[] = [];
  let showVendorForm = false;
  let editingVendor: Vendor | null = null;
  let isProcessing = false;
  let showDeleteModal = false;
  let vendorToDelete: Vendor | null = null;
  let deleteConfirmation = '';

  onMount(async () => {
    await loadVendors();
  });

  async function loadVendors() {
    try {
      isProcessing = true;
      vendors = await getVendorsForEvent(eventId);
    } catch (error) {
      toast.error('Failed to load vendors');
      console.error(error);
    } finally {
      isProcessing = false;
    }
  }

  function confirmDeleteVendor(vendor: Vendor) {
    vendorToDelete = vendor;
    showDeleteModal = true;
    deleteConfirmation = '';
  }

  async function handleDeleteVendor() {
    if (deleteConfirmation !== 'DELETE' || !vendorToDelete) return;
    
    isProcessing = true;
    try {
      // Delete vendor image if exists
      if (vendorToDelete.image_url) {
        await deleteFile(vendorToDelete.image_url);
      }

      await deleteVendor(eventId, vendorToDelete.id!);
      await loadVendors();
      toast.success('Vendor deleted successfully');
    } catch (error) {
      toast.error('Failed to delete vendor');
      console.error(error);
    } finally {
      isProcessing = false;
      showDeleteModal = false;
      vendorToDelete = null;
    }
  }

  function handleVendorSaved() {
    showVendorForm = false;
    editingVendor = null;
    loadVendors();
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center border-b pb-4">
    <h3 class="text-xl font-semibold text-gray-900">Vendors</h3>
    <button 
      on:click={() => { 
        editingVendor = null; 
        showVendorForm = true; 
      }}
      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      Add Vendor
    </button>
  </div>

  {#if vendors.length === 0 && !isProcessing}
    <div class="text-center py-8">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v3a4 4 0 008 0V7m-8 4h8m-8 4h8m4-12a4 4 0 00-8 0v1h8V3z" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">No vendors yet</h3>
      <p class="mt-1 text-sm text-gray-500">Add your first vendor to get started.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each vendors as vendor}
        <div class="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
          {#if vendor.image_url}
            <div class="h-40 bg-gray-100 overflow-hidden">
              <img src={vendor.image_url} alt={vendor.business_name} class="w-full h-full object-cover" />
            </div>
          {/if}
          <div class="p-4">
            <div class="flex justify-between items-start">
              <h4 class="text-lg font-medium text-gray-900">{vendor.business_name}</h4>
              <div class="flex space-x-2">
                  <button 
                  on:click={() => { 
                    editingVendor = vendor; 
                    showVendorForm = true; 
                  }}
                  class="text-blue-600 hover:text-blue-800"
                  aria-label={`Edit ${vendor.business_name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  on:click={() => confirmDeleteVendor(vendor)}
                  class="text-red-600 hover:text-red-800"
                  aria-label={`Delete ${vendor.business_name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {#if vendor.description}
              <p class="mt-2 text-sm text-gray-600 line-clamp-2">{vendor.description}</p>
            {/if}
            
            {#if vendor.categories?.length}
              <div class="mt-3 flex flex-wrap gap-1">
                {#each vendor.categories as category}
                  <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {category}
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if showVendorForm}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <VendorForm 
          eventId={eventId} 
          vendor={editingVendor}
          on:close={handleVendorSaved}
        />
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-bold mb-4">Confirm Deletion</h3>
        <p class="mb-4">This action cannot be undone. Type <strong>DELETE</strong> to confirm:</p>
        
        <input 
          type="text" 
          bind:value={deleteConfirmation}
          class="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Type DELETE"
        />
        
        <div class="flex justify-end space-x-3">
          <button 
            on:click={() => {
              showDeleteModal = false;
              vendorToDelete = null;
            }}
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            on:click={handleDeleteVendor}
            disabled={deleteConfirmation !== 'DELETE' || isProcessing}
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isProcessing ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>