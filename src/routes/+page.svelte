<!-- Home (Tailwind CSS Version) -->

<main class="flex justify-center items-center py-16 px-4 text-center bg-gradient-to-br from-[#c1f0f6] to-[#d9fce4] min-h-[80vh]">
  <section class="max-w-[600px] p-6">
    <h1 class="text-[2rem] text-[#075985] mb-4 font-sans font-semibold">Discover & Experience Events Around You</h1>
    <p class="text-[1.1rem] text-[#2e2e2e] mb-8 font-sans">From concerts to food festivals, City Services brings the city to your fingertips.</p>
    <a
      href="/events"
      class="bg-[#10b981] text-white py-3 px-6 text-base rounded-lg no-underline transition-colors duration-300 hover:bg-[#059669] inline-block"
    >
      Browse Events
    </a>
  </section>
</main>

<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    document.body.className = 'bg-[#f5f9f8] text-[#1a1a1a] font-sans m-0';
  });
</script>

<style global>
  :global(body) {
    font-family: 'Segoe UI', sans-serif;
  }

  @media (max-width: 600px) {
    :global(h1) {
      font-size: 1.5rem;
    }

    :global(p) {
      font-size: 1rem;
    }

    :global(a) {
      width: 100%;
    }
  }
</style>