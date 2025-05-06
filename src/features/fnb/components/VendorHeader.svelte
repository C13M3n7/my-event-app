<script lang="ts">
    export let name: string;
    export let description: string;
    export let rating: number;
</script>

<div class="p-4 bg-gray-100">
    <div class="flex justify-between items-start">
        <div class="text-left">
            <h1 class="text-xl font-bold text-gray-800">{name}</h1>
            <p class="text-gray-600 mt-1">{description}</p>
            <div class="flex items-center mt-1">
                <span class="text-amber-500">★ {rating.toFixed(1)}</span>
                <span class="ml-2 text-sm text-gray-500">(100+ reviews)</span>
            </div>
        </div>
        <a 
            href="/fnb-menu/{name.toLowerCase()}/scan-qr" 
            class="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50"
            aria-label="Scan QR Code for {name}"
        >
            <svg 
                class="w-5 h-5 text-gray-700" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"  
            >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
        </a>
    </div>
</div>