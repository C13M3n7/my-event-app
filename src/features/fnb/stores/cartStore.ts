// src/features/fnb/stores/cartStore.ts
import { writable } from 'svelte/store';

interface DietaryInfo {
  halal?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  note?: string;
  dietaryInfo?: DietaryInfo;
}

interface VendorInfo {
  id: string;
  name: string;
  image?: string;
}

interface VendorCart {
  vendor: VendorInfo;
  items: CartItem[];
}

interface MultiCart {
  [vendorId: string]: VendorCart;
}

// Get cart from localStorage or initialize empty
let loading = true;
const getInitialCart = (): MultiCart => {
  if (typeof window !== 'undefined') {
    try {
      const savedCart = localStorage.getItem('cart');
      loading = false;
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (e) {
      loading = false;
      return {};
    }
  }
  return {};
};

export const cart = writable<MultiCart>(getInitialCart());

// Subscribe to cart changes and save to localStorage
if (typeof window !== 'undefined') {
  cart.subscribe(value => {
    localStorage.setItem('cart', JSON.stringify(value));
  });
}

/**
 * Adds or updates an item in the cart for a specific vendor
 */
export function updateItem(
  vendorId: string,
  vendorInfo: VendorInfo,
  item: {
    id: string;
    name: string;
    price: number;
    image?: string;
    dietaryInfo?: DietaryInfo;
  },
  change: number
) {
  cart.update(current => {
    // Create a new cart object to ensure immutability
    const newCart = { ...current };

    // Initialize vendor cart if it doesn't exist
    if (!newCart[vendorId]) {
      newCart[vendorId] = {
        vendor: vendorInfo,
        items: []
      };
    }

    const vendorCart = newCart[vendorId];
    const existingIndex = vendorCart.items.findIndex(i => i.id === item.id);

    if (existingIndex >= 0) {
      // Update existing item
      const newQuantity = vendorCart.items[existingIndex].quantity + change;
      
      if (newQuantity <= 0) {
        // Remove item if quantity reaches 0
        vendorCart.items.splice(existingIndex, 1);
      } else {
        // Update quantity
        vendorCart.items[existingIndex] = {
          ...vendorCart.items[existingIndex],
          quantity: newQuantity
        };
      }
    } else if (change > 0) {
      // Add new item
      vendorCart.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: change,
        dietaryInfo: item.dietaryInfo
      });
    }

    // Clean up empty vendor carts
    if (vendorCart.items.length === 0) {
      delete newCart[vendorId];
    }

    return newCart;
  });
}

/**
 * Updates item note in the cart
 */
export function updateItemNote(
  vendorId: string,
  itemId: string,
  note: string
) {
  cart.update(current => {
    if (!current[vendorId]) return current;

    const newCart = { ...current };
    const itemIndex = newCart[vendorId].items.findIndex(i => i.id === itemId);

    if (itemIndex >= 0) {
      newCart[vendorId].items[itemIndex] = {
        ...newCart[vendorId].items[itemIndex],
        note: note.trim()
      };
    }

    return newCart;
  });
}

/**
 * Removes an item from a vendor's cart
 */
export function removeItem(vendorId: string, itemId: string) {
  cart.update(current => {
    if (!current[vendorId]) return current;

    const newCart = { ...current };
    newCart[vendorId].items = newCart[vendorId].items.filter(
      item => item.id !== itemId
    );

    // Clean up empty vendor carts
    if (newCart[vendorId].items.length === 0) {
      delete newCart[vendorId];
    }

    return newCart;
  });
}

/**
 * Clears a specific vendor's cart
 */
export function clearVendorCart(vendorId: string) {
  cart.update(current => {
    const newCart = { ...current };
    delete newCart[vendorId];
    return newCart;
  });
}

/**
 * Clears all carts completely
 */
export function clearAllCarts() {
  cart.set({});
}

/**
 * Gets the current quantity of an item in cart
 */
export function getItemQuantity(
  cart: MultiCart,
  vendorId: string,
  itemId: string
): number {
  if (!cart[vendorId]) return 0;
  const item = cart[vendorId].items.find(item => item.id === itemId);
  return item ? item.quantity : 0;
}

/**
 * Gets the total quantity of items for a vendor
 */
export function getVendorItemCount(cart: MultiCart, vendorId: string): number {
  if (!cart[vendorId]) return 0;
  return cart[vendorId].items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Gets the subtotal for a vendor's cart
 */
export function getVendorSubtotal(cart: MultiCart, vendorId: string): number {
  if (!cart[vendorId]) return 0;
  return cart[vendorId].items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}