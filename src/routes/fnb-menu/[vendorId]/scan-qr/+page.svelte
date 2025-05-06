<script lang="ts">
    import { onMount } from 'svelte';
    import { cart } from '$features/fnb/stores/cartStore';
    import { goto } from '$app/navigation';
    import type { BrowserQRCodeReader } from '@zxing/browser';

    let scanError: string | null = null;
    let isScanning = false;
    let scanner: BrowserQRCodeReader | null = null;

    async function startScanner() {
        try {
            isScanning = true;
            scanError = null;
            
            // Dynamically import QR scanner library
            const { BrowserQRCodeReader } = await import('@zxing/browser');
            
            const codeReader = new BrowserQRCodeReader();
            const videoElement = document.getElementById('qr-scanner') as HTMLVideoElement;
            
            if (!videoElement) {
                throw new Error('Video element not found');
            }

            // Start scanning
            await codeReader.decodeFromVideoDevice(
                null, 
                videoElement,
                (result, error) => {
                    if (result) {
                        handleQRResult(result.getText());
                    }
                    if (error) {
                        console.error(error);
                    }
                }
            );
            
            scanner = codeReader;
        } catch (err) {
            scanError = 'Failed to initialize scanner: ' + (err as Error).message;
            isScanning = false;
        }
    }
    
    function stopScanner() {
        if (scanner) {
            scanner.reset();
            scanner = null;
        }
        isScanning = false;
    }

    function handleQRResult(text: string) {
        try {
            const url = new URL(text);
            const table = url.searchParams.get('table');
            const vendorId = url.pathname.split('/')[2];
            
            if (table && vendorId) {
                stopScanner();
                goto(`/fnb-menu/${vendorId}?table=${table}`);
            } else {
                scanError = 'Invalid QR code - no table number found';
            }
        } catch (err) {
            scanError = 'Invalid QR code format';
        }
    }

    onMount(() => {
        startScanner();
        return () => stopScanner();
    });
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
    <h1 class="text-2xl font-bold mb-6">Scan Table QR Code</h1>
    
    <div class="w-full max-w-md bg-black rounded-lg overflow-hidden relative">
        <video id="qr-scanner" class="w-full h-auto" muted playsinline></video>
        
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="border-4 border-blue-400 rounded-lg w-64 h-64"></div>
        </div>
    </div>
    
    {#if scanError}
        <div class="mt-4 p-3 bg-red-100 text-red-700 rounded max-w-md w-full">
            {scanError}
        </div>
    {/if}
    
    <div class="mt-6 text-center text-gray-600">
        <p>Point your camera at the table's QR code</p>
        <p class="text-sm mt-2">The table number will be automatically detected</p>
    </div>
    
    <button 
        on:click={stopScanner}
        class="mt-6 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
    >
        Cancel
    </button>
</div>