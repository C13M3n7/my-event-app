<script lang="ts">
    export let goBack: () => void;
    export let downloadReceipt: () => void;
    export let shareReceipt: () => void;
  
    export let orderNumber = "03261";
    export let orderDate = "31.09.2024, 5:30pm";
    export let orderType = "Oktober Festival 2024";
    export let paymentMethod = "Spay";
    export let items = [
      { name: "Ramen", details: "Very Spicy, Less Noodle", quantity: 1, price: 19 },
      { name: "Salmon Fried Rice", details: "No onion, no garlic", quantity: 1, price: 17 },
      { name: "Sashimi Salad", details: "Sesame Dressing", quantity: 1, price: 15 }
    ];
    export let amount = 51;
    export let points = 11;
    export let grandTotal = 41;
  </script>
  
  <div id="receipt-content" class="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto font-[Segoe_UI] border border-gray-200">
    <!-- Top Bar -->
    <div class="flex justify-between items-center mb-6">
      <button
        on:click={goBack}
        class="text-base font-semibold text-blue-600 hover:underline transition"
      >
        &larr; Order Receipt
      </button>
      <div class="flex gap-2">
        <button
          on:click={downloadReceipt}
          title="Download"
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xl p-2 rounded-md shadow-sm transition-all"
        >
          📥
        </button>
        <button
          on:click={shareReceipt}
          title="Share"
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xl p-2 rounded-md shadow-sm transition-all"
        >
          🔗
        </button>
      </div>
    </div>
  
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-1">Izakaya SDN. BHD.</h2>
      <p class="text-sm text-gray-600">Ground Floor, Sublot 55 (Lot 19733), Block C2, Jalan Saradise,<br />93350 Kuching, Sarawak</p>
    </div>
  
    <!-- Order Info -->
    <div class="text-sm text-gray-700 mb-6 space-y-1">
      <p><strong>Order Number:</strong> {orderNumber}</p>
      <p><strong>Date:</strong> {orderDate}</p>
      <p><strong>Order Type:</strong> {orderType}</p>
      <p><strong>Payment Method:</strong> {paymentMethod}</p>
    </div>
  
    <!-- Order Details -->
    <h3 class="text-lg font-semibold border-b border-gray-200 pb-1 mb-4">Order Details</h3>
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-gray-100 text-gray-700">
          <th class="text-left py-2 px-4 font-medium">Item</th>
          <th class="text-right py-2 px-4 font-medium">Quantity</th>
          <th class="text-right py-2 px-4 font-medium">Price</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each items as item}
          <tr>
            <td class="py-3 px-4">
              <div class="font-medium text-gray-800">{item.name}</div>
              <div class="text-xs text-gray-500">{item.details}</div>
            </td>
            <td class="py-3 px-4 text-right">{item.quantity}</td>
            <td class="py-3 px-4 text-right">RM {item.price}</td>
          </tr>
        {/each}
        <tr>
          <td class="py-2 px-4"></td>
          <td class="py-2 px-4 text-right text-sm text-gray-600">Amount</td>
          <td class="py-2 px-4 text-right text-sm text-gray-700">RM {amount}</td>
        </tr>
        <tr>
          <td class="py-2 px-4"></td>
          <td class="py-2 px-4 text-right text-sm text-gray-600">Points</td>
          <td class="py-2 px-4 text-right text-sm text-red-500">- RM {points}</td>
        </tr>
        <tr class="font-semibold">
          <td class="py-2 px-4"></td>
          <td class="py-2 px-4 text-right text-base">Grand Total</td>
          <td class="py-2 px-4 text-right text-base">RM {grandTotal}</td>
        </tr>
      </tbody>
    </table>
  </div>
  