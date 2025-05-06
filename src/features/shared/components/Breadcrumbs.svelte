<!-- src/features/shared/components/Breadcrumbs.svelte -->
<script lang="ts">
    import type { BreadcrumbItem } from '../types/breadcrumbs';
  
    export let crumbs: BreadcrumbItem[];
    export let className: string = ''; // Changed from 'class' to 'className'
    
    // Set current page automatically for the last item
    $: crumbs = crumbs.map((crumb, i) => ({
      ...crumb,
      current: i === crumbs.length - 1
    }));
  </script>
  
  <nav class={`flex ${className}`} aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
      {#each crumbs as crumb, i}
        <li class="flex items-center">
          {#if !crumb.current}
            <a 
              href={crumb.href} 
              class="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {crumb.name}
            </a>
          {:else}
            <span 
              class="text-sm font-medium text-gray-400"
              aria-current="page"
            >
              {crumb.name}
            </span>
          {/if}
        </li>
        {#if !crumb.current}
          <li class="flex items-center">
            <svg 
              class="h-5 w-5 text-gray-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fill-rule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clip-rule="evenodd" 
              />
            </svg>
          </li>
        {/if}
      {/each}
    </ol>
  </nav>