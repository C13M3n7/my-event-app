export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    note?: string;
    variant?: string;
    dietaryRestrictions?: string[];
    preparationTime?: number; // in minutes
}

export interface CartState {
    items: CartItem[];
    vendorId?: string;
    tableNumber?: string;
    lastUpdated: Date;
}