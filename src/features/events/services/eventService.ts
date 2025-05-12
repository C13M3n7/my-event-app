// src/features/events/services/eventService.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from '$lib/firebase';
import type { EventData } from '$features/adminDashboard/types/eventTypes';

export async function getEventById(eventId: string): Promise<(EventData & { id: string }) | null> {
  try {
    if (!eventId) return null;
    
    const docRef = doc(db, 'events', eventId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.warn(`Event ${eventId} not found in Firestore`);
      return null;
    }

    const data = docSnap.data();
    if (!data) return null;

    return {
      id: docSnap.id,
      ...data
    } as EventData & { id: string };
  } catch (error) {
    console.error(`Error fetching event ${eventId}:`, error);
    return null;
  }
}