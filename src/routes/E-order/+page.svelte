<script>
  import { onMount } from 'svelte';
  import QrScanner from 'qr-scanner'; // You'll need to install this package
  
  let hasCamera = false;
  let scanner = null;
  let scanResult = '';
  let isMobile = false;

  // Check if mobile device
  onMount(() => {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      checkCameraAvailability();
    }
  });

  async function checkCameraAvailability() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasCamera = devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Camera check failed:', error);
    }
  }

  function startScanner() {
    const videoElement = document.getElementById('qr-video');
    scanner = new QrScanner(
      videoElement,
      result => {
        scanResult = result.data;
        scanner.stop();
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );
    scanner.start();
  }

  function stopScanner() {
    if (scanner) {
      scanner.stop();
      scanner = null;
    }
  }
</script>

<section class="min-h-screen bg-gray-50 p-4 md:p-8">
  <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6">E-order System</h1>
    
    {#if isMobile && hasCamera}
      <!-- Mobile QR Scanner Section -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">Scan QR Code</h2>
        <div class="relative aspect-square w-full max-w-md mx-auto border-2 border-gray-300 rounded-lg overflow-hidden">
          <video id="qr-video" class="w-full h-full object-cover"></video>
          <div class="absolute inset-0 border-4 border-blue-400 rounded pointer-events-none"></div>
        </div>
        
        <div class="mt-4 flex justify-center gap-4">
          <button 
            on:click={startScanner}
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Start Scanner
          </button>
          <button 
            on:click={stopScanner}
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Stop Scanner
          </button>
        </div>
        
        {#if scanResult}
          <div class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Scanned: {scanResult}
          </div>
        {/if}
      </div>
    {:else if isMobile && !hasCamera}
      <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
        <p>No camera available. Please use a device with a camera to scan QR codes.</p>
      </div>
    {/if}
    
    <!-- Desktop/Manual Entry Section -->
    <div>
      <h2 class="text-xl font-semibold text-gray-700 mb-4">
        {isMobile ? 'Or enter manually' : 'Enter Order Details'}
      </h2>
      
      <form class="space-y-4">
        <div>
          <label for="orderId" class="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
          <input 
            type="text" 
            id="orderId" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your order ID"
          >
        </div>
        
        <div>
          <label for="orderDetails" class="block text-sm font-medium text-gray-700 mb-1">Order Details</label>
          <textarea 
            id="orderDetails" 
            rows="4" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your order"
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          class="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit Order
        </button>
      </form>
    </div>
  </div>
</section>

<style>
  /* Add this if you're not using a global CSS reset */
  video {
    background: black;
  }
</style>