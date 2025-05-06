// src/features/fnb/types/menu.ts
export interface MenuItem {
    id: string;
    name: string;
    image_url: string; // Changed from 'image'
    category: string[]; // Made non-optional
    price: number;
    description: string; // Made non-optional
    dietary_information: string[]; // Made non-optional
    availability: boolean; // Made non-optional
    // Removed vendorId/vendorName as they're context from parent doc
    preparationTime?: number; // If using in service
    createdAt?: string; // If using in service
    updatedAt?: string; // If using in service
}

export interface VendorInfo {
    id: string;
    name: string;
    description: string;
    rating: number;
    image: string;
    features?: string;
    categories?: string;
    minOrder?: number;
    deliveryFee?: number;
  }