import { writable } from 'svelte/store';
import type { CartItem, CartState } from '../types/cart';

const initialState: CartState = {
    items: [],
    lastUpdated: new Date(),
};

export const cart = writable<CartState>(initialState);

export const cartService = {
    addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
        cart.update(state => {
            const existingIndex = state.items.findIndex(i => 
                i.id === item.id && i.variant === item.variant
            );

            if (existingIndex >= 0) {
                const items = [...state.items];
                items[existingIndex] = {
                    ...items[existingIndex],
                    quantity: items[existingIndex].quantity + (item.quantity || 1)
                };
                return { ...state, items, lastUpdated: new Date() };
            }

            return {
                ...state,
                items: [...state.items, { ...item, quantity: item.quantity || 1 }],
                lastUpdated: new Date()
            };
        });
    },

    updateItem(index: number, updates: Partial<CartItem>): void {
        cart.update(state => {
            if (index < 0 || index >= state.items.length) return state;
            
            const items = [...state.items];
            items[index] = { ...items[index], ...updates };
            
            return { 
                ...state, 
                items, 
                lastUpdated: new Date() 
            };
        });
    },

    removeItem(index: number): void {
        cart.update(state => ({
            ...state,
            items: state.items.filter((_, i) => i !== index),
            lastUpdated: new Date()
        }));
    },

    clearCart(): void {
        cart.update(state => ({
            ...initialState,
            vendorId: state.vendorId // Preserve vendor context
        }));
    },

    setVendor(vendorId: string): void {
        cart.update(state => ({ ...state, vendorId }));
    },

    getSubtotal(items: CartItem[] = []): number {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getTotalItems(): number {
        let count = 0;
        cart.subscribe(state => {
            count = state.items.reduce((sum, item) => sum + item.quantity, 0);
        })();
        return count;
    }
};