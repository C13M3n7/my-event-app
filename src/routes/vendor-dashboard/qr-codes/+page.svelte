<script lang="ts">
    import { onMount } from 'svelte';
    
    let tables = [];
    let selectedTable = '';
    let qrCodeUrl = '';
    let menuUrl = '';
    let isLoading = false;
    let error = null;
    let generatedAt = null;

    // Generate tables (A1-A10, B1-B10, etc.)
    onMount(() => {
        const tableGroups = ['A', 'B', 'C', 'D'];
        tables = tableGroups.flatMap(group => 
            Array.from({ length: 10 }, (_, i) => `${group}${i+1}`)
        );
        selectedTable = tables[0];
    });

    async function generateQR() {
        isLoading = true;
        error = null;
        try {
            const response = await fetch(`/api/qr-codes?table=${selectedTable}`);
            if (!response.ok) throw new Error(await response.text());
            
            const data = await response.json();
            qrCodeUrl = data.qrCode;
            menuUrl = data.menuUrl;
            generatedAt = data.generatedAt;
        } catch (err) {
            error = err.message;
        } finally {
            isLoading = false;
        }
    }

    function downloadQR() {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `table-${selectedTable}-menu-qr.png`;
        link.click();
    }
</script>

<div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Table QR Code Generator</h1>
    
    {#if error}
        <div class="mb-4 p-3 bg-red-100 text-red-700 rounded">
            Error: {error}
        </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Controls -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">Generate New QR Code</h2>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Select Table</label>
                    <select 
                        bind:value={selectedTable}
                        class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        {#each tables as table}
                            <option value={table}>Table {table}</option>
                        {/each}
                    </select>
                </div>
                
                <button 
                    on:click={generateQR}
                    disabled={isLoading}
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                    {#if isLoading}
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    {:else}
                        Generate QR Code
                    {/if}
                </button>
            </div>
            
            {#if generatedAt}
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <h3 class="text-sm font-medium text-gray-500">QR Code Details</h3>
                    <p class="mt-1 text-sm text-gray-600">Created: {new Date(generatedAt).toLocaleString()}</p>
                    <p class="mt-1 text-sm text-gray-600 break-all">URL: {menuUrl}</p>
                </div>
            {/if}
        </div>

        <!-- Preview -->
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 class="text-lg font-semibold mb-4">QR Code Preview</h2>
            
            {#if qrCodeUrl}
                <div class="flex flex-col items-center">
                    <img 
                        src={qrCodeUrl} 
                        alt={`QR Code for Table ${selectedTable}`}
                        class="w-64 h-64 border-4 border-white shadow-md"
                    />
                    <p class="mt-4 text-center text-sm text-gray-600">
                        Scan this code to access the menu for <span class="font-medium">Table {selectedTable}</span>
                    </p>
                    
                    <div class="mt-4 flex gap-2">
                        <button 
                            on:click={downloadQR}
                            class="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100 flex items-center"
                        >
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                        </button>
                        <button 
                            on:click={() => window.print()}
                            class="px-3 py-1 bg-gray-50 text-gray-600 rounded-md text-sm hover:bg-gray-100 flex items-center"
                        >
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </button>
                    </div>
                </div>
            {:else}
                <div class="flex items-center justify-center h-64 bg-gray-50 rounded-md">
                    <p class="text-gray-400">Generate a QR code to preview</p>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    @media print {
        body * {
            visibility: hidden;
        }
        .print-section, .print-section * {
            visibility: visible;
        }
        .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
    }
</style>