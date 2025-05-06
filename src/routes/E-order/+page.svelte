<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import QrScanner from 'qr-scanner';

  let hasCamera = false;
  let scanner: QrScanner | null = null;
  let isScanning = false;
  let cameraPermissionRequested = false;
  let isMobile = false;
  let showManualEntry = false;
  let locationCode = '';
  let isButtonPressed = false;
  let videoElement: HTMLVideoElement | null = null;
  let fileInput: HTMLInputElement | null = null;

  // Valid QR code content to match
  const validQRContent = [
    "https://qrcodes.pro/mneWmK",
    "https://fnb-redirect.com"
  ];

  onMount(() => {
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    checkCameraAvailability();
  });

  onDestroy(() => {
    stopScanning();
  });

  async function checkCameraAvailability() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasCamera = devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Camera check failed:', error);
    }
  }

  async function startScanning() {
    isButtonPressed = true;

    // Animation complete
    setTimeout(() => {
      isButtonPressed = false;

      if (!isMobile) {
        showManualEntry = true;
        return;
      }

      requestCameraAccess();
    }, 300);
  }

  async function requestCameraAccess() {
    try {
      cameraPermissionRequested = true;
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });

      isScanning = true;

      // Wait briefly to ensure video element is bound
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if videoElement is available
      if (!videoElement) {
        throw new Error('Video element not found');
      }

      // Initialize QR scanner
      scanner = new QrScanner(
        videoElement,
        (result) => {
          if (validQRContent.includes(result.data)) {
            stopScanning();
            goto('/fnb-menu');
          } else {
            alert("Invalid QR code. Please scan a valid City Services QR code.");
            stopScanning();
          }
        },
        {
          highlightScanRegion: false,
          highlightCodeOutline: true,
          maxScansPerSecond: 5
        }
      );

      await scanner.start();

    } catch (error) {
      console.error('Camera access error:', error);
      alert('Failed to access camera. Please ensure camera permissions are granted or use manual entry.');
      cameraPermissionRequested = false;
      isScanning = false;
      showManualEntry = true;
      if (scanner) {
        scanner.destroy();
        scanner = null;
      }
    }
  }

  async function scanFromGallery() {
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      try {
        const file = fileInput.files[0];
        const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });

        if (validQRContent.includes(result.data)) {
          stopScanning();
          goto('/fnb-menu');
        } else {
          alert("Invalid QR code. Please select a valid City Services QR code image.");
        }
      } catch (error) {
        console.error('Gallery scan error:', error);
        alert('Failed to scan QR code from image. Please try another image or use camera/manual entry.');
      } finally {
        // Reset file input
        if (fileInput) {
          fileInput.value = '';
        }
      }
    }
  }

  function triggerGalleryScan() {
    if (fileInput) {
      fileInput.click();
    }
  }

  function stopScanning() {
    isScanning = false;
    if (scanner) {
      scanner.stop();
      scanner.destroy();
      scanner = null;
    }
  }

  function submitManualEntry() {
    if (validQRContent.includes(locationCode.trim())) {
      goto('/fnb-menu');
    } else {
      alert("Please enter a valid location code");
    }
  }
</script>

<div class="min-h-screen bg-white flex flex-col items-center justify-center p-6">
  {#if !isScanning && !showManualEntry}
    <!-- Welcome Screen -->
    <div class="text-center max-w-md mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-4">Welcome to City Services</h2>
      <h3 class="text-xl font-medium text-green-600 mb-6">Mobile Order to Table</h3>
      <p class="text-gray-600 mb-12">
        Introducing City Services Mobile Order to Table, a comfortable way to place an order from your table 
        and have it delivered straight to you by our staff.
      </p>

      <!-- Camera Button -->
      <button 
        on:click={startScanning}
        class={`bg-green-500 text-white rounded-full p-5 shadow-md transition-all duration-300 ${isButtonPressed ? 'scale-90' : 'scale-100 hover:scale-105'} mb-4`}
        aria-label="Start scanning QR code"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <p class="mt-4 text-gray-500">Tap to scan QR code</p>
    </div>

    {:else if isScanning}
    <!-- Full-screen Scanning Screen -->
    <div class="fixed inset-0 bg-black z-30 flex flex-col">
      <!-- Full-screen camera view with darkened overlay -->
      <div class="relative flex-1">
        <!-- Dark overlay with rectangular cutout -->
        <div class="absolute inset-0 bg-black bg-opacity-70" 
             style="clip-path: polygon(0% 0%, 0% 100%, 
                                     calc(50% - 40%) 100%, 
                                     calc(50% - 40%) calc(50% - 40%),
                                     calc(50% + 40%) calc(50% - 40%),
                                     calc(50% + 40%) calc(50% + 40%),
                                     calc(50% - 40%) calc(50% + 40%),
                                     calc(50% - 40%) 100%,
                                     100% 100%,
                                     100% 0%)">
        </div>
        
        <!-- Full-screen video -->
        <video bind:this={videoElement} class="absolute inset-0 w-full h-full object-cover" muted playsinline></video>
        
        <!-- Centered scanning frame (80% of viewport width) -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] border-4 border-green-500 rounded-lg 
                    pointer-events-none">
          <!-- Scanning animation -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-scan"></div>
        </div>
        
        <!-- Instruction text -->
        <div class="absolute bottom-20 left-0 right-0 text-center text-white text-lg">
          <p>Align QR code within frame</p>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="p-6 bg-black bg-opacity-50 flex justify-center space-x-8">
        <!-- Manual Entry Button -->
        <button 
          on:click={() => { stopScanning(); showManualEntry = true; }}
          class="rounded-full p-4 bg-gray-500 bg-opacity-50 hover:bg-opacity-70 transition-all"
          aria-label="Enter location manually"
        >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>        
        </button>

        <!-- Scan from Gallery Button -->
        <button 
          on:click={triggerGalleryScan}
          class="rounded-full p-4 bg-blue-700 bg-opacity-50 hover:bg-opacity-70 transition-all"
          aria-label="Scan QR code from gallery"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          bind:this={fileInput}
          on:change={scanFromGallery}
          class="hidden"
        />

        <!-- Return Button -->
        <button 
          on:click={stopScanning}
          class="rounded-full p-4 bg-red-700 bg-opacity-50 hover:bg-opacity-70 transition-all"
          aria-label="Return to welcome screen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>

  {:else if showManualEntry}
    <!-- Manual Entry Screen -->
    <div class="w-full max-w-sm bg-white rounded-lg p-6">
      <button 
        on:click={() => showManualEntry = false}
        class="mb-4 text-gray-500 flex items-center"
        aria-label="Back to scanning screen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h3 class="text-xl font-bold text-gray-900 mb-6">Enter Location Code</h3>

      <div class="mb-4">
        <label for="locationCode" class="block text-gray-700 text-sm font-medium mb-2">Location Code</label>
        <input
          id="locationCode"
          type="text"
          bind:value={locationCode}
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Enter code provided at your table"
        />
      </div>

      <button 
        on:click={submitManualEntry}
        class="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium"
      >
        Confirm Location
      </button>
    </div>
  {/if}
</div>

<style>
  .animate-scan {
    animation: scan 2s linear infinite;
  }

  @keyframes scan {
    0% { top: 20%; opacity: 1; }
    50% { top: 80%; opacity: 0.5; }
    100% { top: 20%; opacity: 1; }
  }
</style>