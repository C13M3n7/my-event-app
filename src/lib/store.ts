// lib/stores.ts
import { writable } from 'svelte/store';

interface CartItem {
    name: string;
    price: number;
    quantity: number;
    image: string;
    note: string;
}

export const cart = writable<CartItem[]>([]);

// Helper functions for cart operations
export function addToCart(item: Omit<CartItem, 'quantity'>) {
    cart.update(items => {
        const existing = items.find(i => i.name === item.name);
        if (existing) {
            return items.map(i => 
                i.name === item.name ? {...i, quantity: i.quantity + 1} : i
            );
        }
        return [...items, {...item, quantity: 1}];
    });
}

export function updateCartItem(name: string, quantity: number) {
    cart.update(items => {
        if (quantity <= 0) {
            return items.filter(i => i.name !== name);
        }
        return items.map(i => 
            i.name === name ? {...i, quantity} : i
        );
    });
}