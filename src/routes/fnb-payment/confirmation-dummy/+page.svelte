<script lang="ts">
    let rating = 0;
    let hoverRating = 0;
    let feedback = '';
    let isSubmitted = false;
  
    const handleRating = (value: number) => {
      rating = value;
    };
  
    const submitFeedback = () => {
      isSubmitted = true;
    };
  </script>
  
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
      {#if !isSubmitted}
        <!-- Success Message -->
        <div class="mb-6">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p class="text-gray-600">Thank you for your purchase.</p>
        </div>
  
        <!-- Rating Section -->
        <div class="mb-6">
          <h2 class="text-lg font-medium mb-3">Rate your experience</h2>
          <div class="flex justify-center space-x-2 mb-4">
            {#each [1, 2, 3, 4, 5] as star}
              <button
                on:click={() => handleRating(star)}
                on:mouseenter={() => hoverRating = star}
                on:mouseleave={() => hoverRating = 0}
                class="focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class={`h-8 w-8 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            {/each}
          </div>
  
          <!-- Feedback Form -->
          <div class="mb-6">
            <label for="feedback" class="block text-sm font-medium text-gray-700 mb-2">Your feedback (optional)</label>
            <textarea
              id="feedback"
              bind:value={feedback}
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How was your experience?"
            ></textarea>
          </div>
  
          <button
            on:click={submitFeedback}
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      {:else}
        <!-- Thank You Message After Submission -->
        <div class="py-8">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p class="text-gray-600 mb-6">We appreciate your feedback.</p>
          <button
            on:click={() => window.location.href = '/'}
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      {/if}
    </div>
  </div>