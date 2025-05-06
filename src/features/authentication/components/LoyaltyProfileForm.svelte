<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let email: string;
  let firstName = '';
  let lastName = '';
  let dateOfBirth = '';
  let interests: string[] = [
    "Music Events", 
    "Sports", 
    "Food & Beverage", 
    "Workshops", 
    "Technology", 
    "Arts & Culture"
  ];
  let selectedInterests: string[] = [];
  let race = '';
  let isSubmitting = false; // Add this with your other variables

  const handleSubmit = async () => {
    dispatch('error', '');

    // Validation
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth || 
        selectedInterests.length === 0 || !race) {
      dispatch('error', 'Please fill in all fields');
      return;
    }

    isSubmitting = true;
    
    try {
      dispatch('submit', {
        firstName,
        lastName,
        birthDate: dateOfBirth,
        interests: selectedInterests,
        race,
        // Include these additional fields
        loyaltyMember: true,
        joinedAt: new Date().toISOString(),
        points: 0,
        status: 'active',
        profileComplete: true
      });
    } catch (error) {
      dispatch('error', error instanceof Error ? error.message : 'Submission failed');
    } finally {
      isSubmitting = false;
    }
  };
</script>

<div class="p-6 bg-white rounded-lg shadow-sm">
  <h2 class="text-xl font-bold mb-4">Complete Your Profile</h2>
  
  <div class="mb-4">
    <label for="email-display" class="block text-sm font-medium mb-1">Email</label>
    <div id="email-display" class="p-2 bg-gray-100 rounded">{email}</div>
  </div>

  <div class="space-y-4">
    <div>
      <label for="firstName" class="block text-sm font-medium mb-1">First Name</label>
      <input
        id="firstName"
        class="w-full border rounded-lg px-3 py-2"
        bind:value={firstName}
        required
      />
    </div>

    <div>
      <label for="lastName" class="block text-sm font-medium mb-1">Last Name</label>
      <input
        id="lastName"
        class="w-full border rounded-lg px-3 py-2"
        bind:value={lastName}
        required
      />
    </div>

    <div>
      <label for="dateOfBirth" class="block text-sm font-medium mb-1">Date of Birth</label>
      <input
        id="dateOfBirth"
        type="date"
        class="w-full border rounded-lg px-3 py-2"
        bind:value={dateOfBirth}
        required
      />
    </div>

    <fieldset>
      <legend class="block text-sm font-medium mb-1">Interests</legend>
      <div class="space-y-2">
        {#each interests as interest, i}
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id={`interest-${i}`}
              bind:group={selectedInterests} 
              value={interest}
            />
            <label for={`interest-${i}`}>{interest}</label>
          </div>
        {/each}
      </div>
    </fieldset>

    <div>
      <label for="race" class="block text-sm font-medium mb-1">Race</label>
      <select
        id="race"
        class="w-full border rounded-lg px-3 py-2"
        bind:value={race}
        required
      >
        <option value="">Select Race</option>
        <option value="Asian">Asian</option>
        <option value="Caucasian">Caucasian</option>
        <option value="Black">Black</option>
        <option value="Hispanic">Hispanic</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <button
      class="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 disabled:opacity-50"
      on:click={handleSubmit}
      disabled={isSubmitting}
    >
      {#if isSubmitting}
        Processing...
      {:else}
        Complete Registration
      {/if}
    </button>
  </div>
</div>