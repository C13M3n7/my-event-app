// src/features/adminDashboard/types/vendorTypes.ts
export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    website?: string;
  }
  
  export interface Vendor {
    id?: string; // Optional because it's assigned by Firestore
    business_name: string;
    description: string;
    email: string;
    phone_number: string;
    social_media: SocialMedia;
    rating: number;
    categories: string[];
    features: string[];
    image_url?: string;
    created_at?: string; // ISO date string
  }
  
  // You can add more related types here if needed
  export interface VendorFormData extends Omit<Vendor, 'id' | 'created_at'> {
    // Additional form-specific types if needed
  }