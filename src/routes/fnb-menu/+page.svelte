<script lang="ts">
    import { cart } from '$lib/store';

    let showFilterDropdown = false;
    let searchQuery = '';
    let selectedCategory = 'All';
    let tableNumber = '1';
  
    let products = [
        {
            title: 'Wicked Wings',
            image: 'images/wicked-wings.png',
            category: 'Food',
            price: 8.99,
            quantity: 0,
            vendor: 'KFC'
        },
        {
            title: 'Nuggets',
            image: 'images/nuggets.png',
            category: 'Food',
            price: 5.50,
            quantity: 0,
            vendor: 'KFC'
        },
        {
            title: 'Cola',
            image: 'images/cola.png',
            category: 'Drinks',
            price: 2.00,
            quantity: 0,
            vendor: 'KFC'
        },
        {
            title: 'Snack Plate',
            image: 'images/snack-plate.jpg',
            category: 'Food',
            price: 7.99,
            quantity: 0,
            vendor: 'KFC'
        }
    ];
  
    function toggleFilterDropdown() {
        showFilterDropdown = !showFilterDropdown;
    }
  
    function updateQuantity(index: number, delta: number) {
        const product = filteredProducts[index];
        const newQuantity = Math.max(0, product.quantity + delta);
        
        cart.update(items => {
            const existingIndex = items.findIndex(i => i.name === product.title);
            
            if (newQuantity === 0) {
                return items.filter(i => i.name !== product.title);
            } else if (existingIndex >= 0) {
                return items.map((item, i) => 
                    i === existingIndex 
                        ? {...item, quantity: newQuantity} 
                        : item
                );
            } else {
                return [...items, {
                    name: product.title,
                    price: product.price,
                    quantity: newQuantity,
                    image: product.image,
                    note: ''
                }];
            }
        });

        filteredProducts[index].quantity = newQuantity;
        filteredProducts = filteredProducts;
    }
  
    $: availableCategories = ['All', ...new Set(products.map(p => p.category))];
  
    $: filteredProducts = products.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
                            item.title.toLowerCase().includes(searchQuery.toLowerCase()) 
        return matchesCategory && matchesSearch;
    });

    $: cartItemCount = $cart.reduce((total, item) => total + item.quantity, 0);
</script>

<!-- Header with Back Arrow -->
<div class="flex items-center p-3 bg-gray-100 border-b border-gray-200">
    <button 
        class="text-2xl bg-transparent border-none cursor-pointer hover:text-gray-600" 
        on:click={() => window.history.back()} 
        aria-label="Go back"
    >
        ←
    </button>
</div>

<!-- Vendor Info -->
<div class="p-4 bg-gray-100">
    <div class="text-left">
        <p class="text-xl font-bold text-gray-800">{products[0].vendor}</p>
        <p class="text-gray-600 mt-1">Delicious and crispy meals, just like you love it! Serving you the best fast food!</p>
        <p class="text-amber-500 mt-1">Ratings: 4.5 ★</p>
    </div>
</div>

<!-- Search and Filter Bar -->
<div class="sticky top-0 z-10 flex items-center justify-between p-3 bg-white shadow-sm">
    <div class="flex-1 mr-2">
        <input 
            type="text" 
            bind:value={searchQuery} 
            placeholder="Search food..." 
            aria-label="Search food items"
            class="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
    <div class="relative">
        <button 
            on:click={toggleFilterDropdown} 
            class="p-2 text-gray-700 rounded-full hover:bg-gray-100" 
            aria-label="Filter options"
        >
            <div class="flex items-center justify-center w-6 h-6">
                <div class="relative">
                    <div class="w-6 h-1 bg-gray-600 rounded-full mb-1"></div>
                    <div class="w-6 h-1 bg-gray-600 rounded-full mb-1"></div>
                    <div class="absolute top-0 left-0 w-2 h-2 bg-amber-500 rounded-full"></div>
                </div>
            </div>
        </button>
        {#if showFilterDropdown}
            <div class="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20">
                <select 
                    bind:value={selectedCategory} 
                    aria-label="Select category"
                    class="w-full px-3 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {#each availableCategories as category}
                        <option value={category}>{category}</option>
                    {/each}
                </select>
            </div>
        {/if}
    </div>
</div>

<!-- Table Number Section -->
<div class="px-4 py-3">
    <div class="flex items-center">
        <label for="table-number" class="mr-2 text-gray-700">Table Number:</label>
        <input 
            id="table-number" 
            type="text" 
            bind:value={tableNumber} 
            placeholder="Table No." 
            aria-label="Enter table number"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
</div>

<!-- Product Listing - Mobile Optimized -->
<section class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 md:grid-cols-4">
    {#each filteredProducts as item, index}
        <div class="bg-white rounded-lg overflow-hidden">
            <!-- Image with fixed aspect ratio -->
            <div class="relative aspect-square overflow-hidden">
                <img 
                    src={item.image} 
                    alt={item.title} 
                    class="w-full h-full object-cover"
                />
                
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex flex-col justify-end p-2">
                    <h4 class="text-white font-semibold text-sm line-clamp-1">{item.title}</h4>
                </div>
            </div>
            
         =
            <div class="p-2">
                <div class="flex items-center justify-between">
                    <p class="font-bold text-gray-900 text-sm">RM {item.price.toFixed(2)}</p>
                    <div class="flex items-center space-x-2">
                        <button 
                            class="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors active:scale-95"
                            on:click={() => updateQuantity(index, -1)} 
                            disabled={item.quantity <= 0}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span class="text-sm font-medium min-w-[1rem] text-center">{item.quantity}</span>
                        <button 
                            class="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors active:scale-95"
                            on:click={() => updateQuantity(index, 1)}
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {/each}
</section>

<!-- Cart Link -->
<a 
    href="/cart" 
    class="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors z-50"
    aria-label="View cart"
>
    <span class="text-2xl">🛒</span>
    {#if cartItemCount > 0}
        <span class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
            {cartItemCount}
        </span>
    {/if}
</a>