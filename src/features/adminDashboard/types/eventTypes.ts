// src/features/adminDashboard/types/eventTypes.ts
export interface PricingTier {
  name: string;
  price: string;
}

export type EventType = "free" | "paid";
export type EventCategory = "festive" | "concert" | "conference";

export interface EventData {
  id?: string;
  title: string;
  location: string;  // This will now be the Google Maps URL
  locationName: string;  
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  tagline: string;
  eventType: EventType;
  pricingTiers: PricingTier[];
  expectedAttendees: string;
  socialMediaUrl: string;
  videoUrl: string;
  eventBriefUrl?: string;  
  imagePreview: string | null;
  layoutImagePreview: string | null;
  type: EventCategory;
  termsAgreed: boolean;
  createdAt?: string;
}