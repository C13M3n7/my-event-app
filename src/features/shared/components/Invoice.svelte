<script>
  let invoiceType = 'Individual';
  let idType = 'MyKad';
  let idNumber = '';
  let fullName = 'Huat Ong Heng';
  let mobileNumber = '+601101018888';
  let email = 'Huatongheng@gmail.com';
  let setDefault = true;
</script>

<div class="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto font-[Segoe_UI]">
  <h2 class="text-xl font-semibold">Request E-Invoice</h2>

  <div class="bg-yellow-50 p-4 mb-4 text-yellow-700 border-l-4 border-yellow-400 rounded-md text-sm">
    ⚠️ Please ensure the information is accurate. E-Invoice will only be generated once per order, and information cannot be changed upon successful request.
  </div>

  <section class="mt-4">
    <h3 class="mt-4 font-semibold">Invoice Information</h3>

    <h4 class="mt-4 font-semibold">Invoice Type</h4>
    <div class="flex flex-wrap gap-2 my-2">
      <button class:active={invoiceType === 'Individual'} on:click={() => invoiceType = 'Individual'}
        class="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-inner"
        class:!border-blue-600={invoiceType === 'Individual'}
        class:!bg-blue-50={invoiceType === 'Individual'}
        class:!text-blue-600={invoiceType === 'Individual'}>
        Individual
      </button>
      <button class:active={invoiceType === 'Registered Business'} on:click={() => invoiceType = 'Registered Business'}
        class="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-inner"
        class:!border-blue-600={invoiceType === 'Registered Business'}
        class:!bg-blue-50={invoiceType === 'Registered Business'}
        class:!text-blue-600={invoiceType === 'Registered Business'}>
        Registered Business
      </button>
    </div>

    <h4 class="mt-4 font-semibold">ID Type</h4>
    <div class="flex flex-wrap gap-2 my-2">
      {#each ['MyKad', 'My Tentera', 'MyPR', 'MyKas', 'Passport', 'Visa'] as type}
        <button class:active={idType === type} on:click={() => idType = type}
          class="px-4 py-2 bg-gray-50 border border-gray-300 rounded-md cursor-pointer text-sm text-gray-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:shadow-inner"
          class:!border-blue-600={idType === type}
          class:!bg-blue-50={idType === type}
          class:!text-blue-600={idType === type}>
          {type}
        </button>
      {/each}
    </div>

    <h4 class="mt-4 font-semibold">ID Number</h4>
    <input class="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none" placeholder="Empty" bind:value={idNumber} />
  </section>

  <section class="mt-4">
    <h4 class="mt-4 font-semibold">Personal Information</h4>
    <input class="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none" placeholder="Full Name" bind:value={fullName} />
    <input class="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none" placeholder="Mobile Number" bind:value={mobileNumber} />
    <input class="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none" placeholder="Email" type="email" bind:value={email} />
  </section>

  <div class="flex justify-between items-center mt-4 py-2">
    <span>Set as default invoice information</span>
    <button class="text-2xl bg-transparent border-none cursor-pointer p-0 transition-transform hover:scale-110" on:click={() => setDefault = !setDefault}>
      {setDefault ? '🔛' : '🔘'}
    </button>
  </div>

  <div class="mb-4 text-sm">
    <h4 class="font-semibold">Notice</h4>
    <p>By completing the details and clicking the submit button, you acknowledge that:</p>
    <ol class="list-decimal list-inside">
      <li>....................</li>
      <li>....................</li>
    </ol>
  </div>

  <button class="w-full p-4 bg-blue-600 text-white rounded-lg font-semibold text-base shadow-lg transition-all hover:bg-blue-700 hover:-translate-y-[1px] hover:shadow-xl active:translate-y-0 active:shadow-inner">
    Submit Request
  </button>
</div>
