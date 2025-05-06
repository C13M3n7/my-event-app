<script lang="ts">
    export let activeTab: 'email' | 'phone';
  </script>
  
  <div class="flex border-b mb-6">
    <button
      class={`flex-1 py-3 font-medium ${activeTab === 'email' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
      on:click={() => activeTab = 'email'}
    >
      Email
    </button>
    <button
      class={`flex-1 py-3 font-medium ${activeTab === 'phone' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
      on:click={() => activeTab = 'phone'}
    >
      Phone
    </button>
  </div>
  