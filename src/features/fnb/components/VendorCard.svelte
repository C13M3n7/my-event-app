<!-- src/features/fnb/components/VendorCard.svelte -->
<script lang="ts">
  export let id: string;
  export let name: string;
  export let description: string;
  export let rating: number;
  export let image: string;
  export let features: string;
  export let categories: string;
</script>

<div class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
  <!-- Image with Aspect Ratio -->
  <div class="relative aspect-video overflow-hidden">
    {#if image}
      <img 
        src={image} 
        alt={name} 
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        on:error={(e) => { const target = e.target as HTMLImageElement; if (target) target.src = '/images/fnb/default-vendor.jpg'; }}
      />
    {:else}
      <div class="w-full h-full bg-gray-100 flex items-center justify-center">
        <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    {/if}
    
    <!-- Rating Badge -->
    <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center shadow-xs">
      <span class="text-yellow-400 text-sm">★</span>
      <span class="text-xs font-medium text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  </div>
  
  <!-- Content -->
  <div class="p-4">
    <h3 class="font-bold text-lg text-gray-900 truncate">{name}</h3>
    <p class="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
    
    {#if features || categories}
      <div class="mt-3 flex flex-wrap gap-2">
        {#if features}
          {#each features.split(',').slice(0, 2) as feature}
            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {feature.trim()}
            </span>
          {/each}
        {/if}
        {#if categories}
          {#each categories.split(',').slice(0, 1) as category}
            <span class="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
              {category.trim()}
            </span>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>