<!-- src/features/adminDashboard/components/VendorForm.svelte -->
<script lang="ts">
    import { addVendor } from '$features/fnb/services/fnbService';
    import { toast } from 'svelte-sonner';
    import { goto } from '$app/navigation';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    // Form data with types
    let formData = {
      business_name: '',
      description: '',
      email: '',
      phone_number: '',
      social_media: {
        facebook: '',
        instagram: '',
        website: ''
      },
      rating: 4.0,
      categories: [] as string[],
      features: [] as string[],
      image_url: ''
    };
  
    let imageFile: File | null = null;
    let isSubmitting = false;
    let availableCategories = ['Food', 'Beverage', 'Dessert', 'Vegetarian', 'Vegan'];
    let availableFeatures = ['Delivery', 'Pickup', 'Halal', 'Organic'];
  
    const handleImageUpload = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        if (input.files[0].size > 5 * 1024 * 1024) { // 5MB limit
          toast.error('Image size must be less than 5MB');
          return;
        }
        imageFile = input.files[0];
        
        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
          formData.image_url = e.target?.result as string;
        };
        reader.readAsDataURL(imageFile);
      }
    };
  
    const handleSubmit = async () => {
      if (!formData.business_name) {
        toast.error('Business name is required');
        return;
      }
  
      isSubmitting = true;
      try {
        const vendorId = await addVendor({
          ...formData,
          social_media_links: {
            facebook: formData.social_media.facebook,
            instagram: formData.social_media.instagram,
            website: formData.social_media.website
          },
          features: formData.features.join(', '),
          categories: formData.categories.join(', ')
        }, imageFile);
  
        if (vendorId) {
          toast.success('Vendor created successfully!');
          goto('/admin/vendors'); // Redirect to vendors list
        }
      } catch (error) {
        toast.error('Failed to create vendor: ' + (error as Error).message);
      } finally {
        isSubmitting = false;
      }
    };

    const handleClose = () => {
      dispatch('close');
    };
  </script>
  
  <div class="bg-white rounded-lg shadow p-6">

    <h2 class="text-2xl font-bold mb-6 text-gray-800">Add New Vendor</h2>
  
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <!-- Business Info Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Business Name -->
        <div>
          <label for="business_name" class="block text-sm font-medium text-gray-700 mb-1">
            Business Name <span class="text-red-500">*</span>
          </label>
          <input
            id="business_name"
            bind:value={formData.business_name}
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
  
        <!-- Rating -->
        <div>
          <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
          <select
            id="rating"
            bind:value={formData.rating}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
          </select>
        </div>
      </div>
  
      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          bind:value={formData.description}
          rows={4}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
  
      <!-- Image Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Vendor Image</label>
        <div class="flex items-center space-x-4">
          {#if formData.image_url}
            <img 
              src={formData.image_url} 
              alt="Vendor preview" 
              class="w-16 h-16 object-cover rounded-md"
            >
          {:else}
            <div class="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          {/if}
          <div class="flex-1">
            <input
              type="file"
              accept="image/*"
              on:change={handleImageUpload}
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p class="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
          </div>
        </div>
      </div>
  
      <!-- Categories & Features -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
          <div class="space-y-2">
            {#each availableCategories as category}
              <label class="flex items-center">
                <input
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  bind:group={formData.categories}
                  value={category}
                />
                <span class="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            {/each}
          </div>
        </div>
  
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div class="space-y-2">
            {#each availableFeatures as feature}
              <label class="flex items-center">
                <input
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  bind:group={formData.features}
                  value={feature}
                />
                <span class="ml-2 text-sm text-gray-700">{feature}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>
  
      <!-- Contact Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            bind:value={formData.email}
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
  
        <div>
          <label for="phone_number" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            id="phone_number"
            bind:value={formData.phone_number}
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
  
      <!-- Social Media -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label for="facebook" class="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              fb.com/
            </span>
            <input
              id="facebook"
              bind:value={formData.social_media.facebook}
              type="text"
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
  
        <div>
          <label for="instagram" class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              @
            </span>
            <input
              id="instagram"
              bind:value={formData.social_media.instagram}
              type="text"
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
  
        <div>
          <label for="website" class="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              https://
            </span>
            <input
              id="website"
              bind:value={formData.social_media.website}
              type="url"
              class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
  
      <!-- Submit Button -->
      <div class="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isSubmitting}
            <span class="flex items-center">
              <!-- Loading spinner SVG -->
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          {:else}
            Save Vendor
          {/if}
        </button>
      </div>
    </form>
  </div>