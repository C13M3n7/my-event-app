// Admin Firestore interactions

// src/features/adminDashboard/services/adminService.ts
import { db } from '$lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { query, getDocs, orderBy } from 'firebase/firestore';

export const getEvents = async () => {
  try {
    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to Date if needed
      startDate: doc.data().startDate?.toDate()?.toISOString(),
      endDate: doc.data().endDate?.toDate()?.toISOString()
    }));
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

export const saveEvent = async (eventData: any) => {
  try {
    const eventWithTimestamp = {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'events'), eventWithTimestamp);
    return { id: docRef.id, ...eventData };
  } catch (error) {
    console.error('Error saving event:', error);
    throw error;
  }
};

export const updateEvent = async (id: string, eventData: any) => {
  try {
    const eventRef = doc(db, 'events', id);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: serverTimestamp()
    });
    return { id, ...eventData };
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    const eventRef = doc(db, 'events', id);
    await deleteDoc(eventRef);
    return id;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};