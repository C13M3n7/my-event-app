<script lang="ts">
    import { goto } from '$app/navigation';
    
    let rating = 0;
    let feedback = "";
  
    function handleReturn() {
        goto('/'); // Redirect to homepage instead of just logging
    }

    function handleStarClick(star: number, event: KeyboardEvent) {
        if (event.type === 'click' || event.key === 'Enter' || event.key === ' ') {
            rating = star;
            event.preventDefault();
        }
    }
</script>
  
<div class="flex flex-col items-center justify-center min-h-screen p-5 text-center bg-gray-50">
    <!-- Success State (always shown since we're coming from successful checkout) -->
    <div class="w-full max-w-2xl p-8 bg-white rounded-xl shadow-md">
        <!-- Payment Confirmation Title -->
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Payment Confirmation</h1>
        
        <!-- Success Icon -->
        <div class="flex justify-center my-6">
            <span class="text-5xl text-green-500" aria-hidden="true">✔️✔️✔️</span>
        </div>
        
        <!-- Success Message -->
        <h2 class="text-2xl font-semibold text-gray-800 mb-3">Thank you for your order!</h2>
        <p class="text-gray-600 mb-8">Your payment has been successfully processed.
            A confirmation will be sent to your email.</p>
        
        <!-- Ratings Section -->
        <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-700 mb-4">Rate your experience:</h3>
            <div class="flex justify-center gap-3" role="radiogroup">
                {#each [1, 2, 3, 4, 5] as star}
                    <button
                        class="text-4xl p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        class:bg-gray-100={star <= rating}
                        class:text-yellow-400={star <= rating}
                        class:text-gray-300={star > rating}
                        on:click={() => rating = star}
                        on:keydown={(e) => handleStarClick(star, e)}
                        role="radio"
                        aria-checked={star <= rating}
                        tabindex={star === 1 ? 0 : -1}
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                        {star <= rating ? "★" : "☆"}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Feedback Section -->
        <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-700 mb-4">Leave feedback (optional):</h3>
            <textarea 
                bind:value={feedback} 
                placeholder="Your feedback here..." 
                rows="4"
                class="w-full max-w-lg p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                aria-label="Feedback text area"
            ></textarea>
        </div>
    </div>
</div>