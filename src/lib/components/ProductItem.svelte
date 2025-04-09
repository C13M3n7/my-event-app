<!-- lib/components/ProductItem.svelte -->
<script lang="ts">
    import { updateCartItem } from '$lib/store';
    
    export let product: {
        title: string;
        description: string;
        image: string;
        price: string;
        quantity: number;
    };

    function handleQuantityChange(delta: number) {
        const newQuantity = product.quantity + delta;
        updateCartItem(product.title, newQuantity);
    }
</script>

<div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div class="h-48 overflow-hidden">
        <img 
            src={product.image} 
            alt={product.title} 
            class="w-full h-full object-cover transition-transform hover:scale-105"
        />
    </div>
    <div class="p-4">
        <h4 class="font-semibold text-gray-800">{product.title}</h4>
        <p class="mt-1 text-sm text-gray-600">{product.description}</p>
        <p class="mt-2 font-bold text-gray-900">{product.price}</p>
        <div class="flex items-center justify-between mt-4 space-x-4">
            <button 
                class="w-11 h-11 flex items-center justify-center bg-white text-gray-800 rounded-xl shadow hover:shadow-md active:shadow-sm text-2xl font-black transition-all"
                on:click={() => handleQuantityChange(-1)} 
                disabled={product.quantity <= 0}
                aria-label="Decrease quantity"
            >
                &#8722;
            </button>
        
            <span class="text-lg font-semibold w-10 text-center">{product.quantity}</span>
        
            <button 
                class="w-11 h-11 flex items-center justify-center bg-white text-gray-800 rounded-xl shadow hover:shadow-md active:shadow-sm text-2xl font-black transition-all"
                on:click={() => handleQuantityChange(1)} 
                aria-label="Increase quantity"
            >
                +
            </button>
        </div>                
    </div>
</div>