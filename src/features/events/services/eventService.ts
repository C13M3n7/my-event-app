import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '$lib/firebase'; // Assuming the Firestore instance is initialized correctly in your app

export type Event = {
    id: string;
    title: string;
    description: string;
    image_url: string;
    event_types: string[];
    is_free: boolean;
    organiser: string;
    location: {
      name: string;
      address: string;
    };
    retail_dates?: {
      start: any;
      end: any;
      hours: string;
    };
    festival_dates?: {
      start: any;
      end: any;
      hours: string;
    };
    max_capacity?: number;
    registration_url?: string;
    speakers?: {
      name: string;
      title: string;
      bio: string;
      photo_url: string;
      has_paid_sessions: boolean;
      base_price?: number;
    }[]; 
    agenda?: {
      date: string;
      day_title: string;
      slots: {
        time: string;
        title: string;
        speaker_names: string[];
        location: string;
        is_paid: boolean;
        price: number;
        currency?: string;
      }[]; 
    }[]; 
    start_date?: any;  // Add this field to support event start date
};

// Helper function to get event date (handles both retail and festival dates)
const getEventDate = (event: Event): string => {
  if (event.start_date instanceof Timestamp) {
    const date = event.start_date.toDate();
    return date.toLocaleDateString();  // Format date to string
  }
  if (event.festival_dates?.start instanceof Timestamp) {
    const date = event.festival_dates.start.toDate();
    return date.toLocaleDateString();
  }
  if (event.retail_dates?.start instanceof Timestamp) {
    const date = event.retail_dates.start.toDate();
    return date.toLocaleDateString();
  }
  return "Date not available";
};

export const getUpcomingEvents = async (): Promise<Event[]> => {
  const eventQuerySnapshot = await getDocs(collection(getFirestore(), 'events'));
  const events: Event[] = [];
  eventQuerySnapshot.forEach((doc) => {
    const eventData = doc.data();
    events.push({
      id: doc.id,
      title: eventData.title,
      description: eventData.description,
      image_url: eventData.image_url,
      event_types: eventData.event_types,
      is_free: eventData.is_free,
      organiser: eventData.organiser,
      location: eventData.location,
      retail_dates: eventData.retail_dates,
      festival_dates: eventData.festival_dates,
      max_capacity: eventData.max_capacity,
      registration_url: eventData.registration_url,
      speakers: eventData.speakers,
      agenda: eventData.agenda,
      start_date: eventData.start_date,  // Store the start_date
    });
  });
  return events;
};
