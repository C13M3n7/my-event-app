// src/features/events/types/event.ts
export interface Event {
  id: string; // Make sure this is included
  title: string;
  description: string;
  image: string;
  image_url?: string;
  price: string;
  is_free: boolean;
  organiser: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  event_types: string[];
  features: {
    music: string;
    food: string;
    retail: string;
    engagement: string;
  };
  agenda: Array<{
    date: string;
    day_title: string;
    slots: Array<{
      time: string;
      title: string;
      description: string;
      speaker_names: string[];
      location: string;
      is_paid: boolean;
      price: number;
      currency: string;
    }>;
  }>;
  speakers: Array<{
    name: string;
    title: string;
    bio: string;
    photo_url: string;
    has_paid_sessions: boolean;
    base_price: number;
  }>;
  socialMedia: {
    instagram: string;
    facebook: string;
  };
  venueMapUrl: string | null;
  layoutUrl: string | null;
  videoUrl: string;
  organizers: Array<{
    name: string;
    role: string;
  }>;
  vendors: string[];
  registration_url: string;
  eventBriefUrl?: string;
}
export type EventTab = 'about' | 'program' | 'map' | 'speakers' | 'vendors';