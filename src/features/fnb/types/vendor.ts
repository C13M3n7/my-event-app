import { Timestamp } from "firebase/firestore";

export interface Vendor {
    id: string;
    user_id: string;
    business_name: string;
    description: string;
    email: string;
    phone_number: string;
    social_media_links: Record<string, string>;
    image_url: string;
    created_at: Timestamp;
    updated_at: Timestamp;
    rating?: number;
    features?: string;
    categories?: string;
  }
  
  export interface VendorFormData {
    business_name: string;
    description: string;
    email: string;
    phone_number: string;
    social_media_links?: Record<string, string>;
    rating?: number;
    features?: string | string[];
    categories?: string | string[];
    image_url?: string; // Add this line
  }