
import { db } from '$lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Vendor, SocialMedia } from '$features/adminDashboard/types/vendorTypes';

export const addVendor = async (eventId: string, vendorData: Omit<Vendor, 'id'>): Promise<string> => {
  const vendorRef = await addDoc(collection(db, `events/${eventId}/vendors`), vendorData);
  return vendorRef.id;
};

export const getVendorsForEvent = async (eventId: string): Promise<Vendor[]> => {
  const querySnapshot = await getDocs(collection(db, `events/${eventId}/vendors`));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<Vendor, 'id'>
  }));
};

export const updateVendor = async (
  eventId: string,
  vendorId: string,
  vendorData: Partial<Vendor>
): Promise<void> => {
  await updateDoc(doc(db, `events/${eventId}/vendors/${vendorId}`), vendorData);
};

export const deleteVendor = async (eventId: string, vendorId: string): Promise<void> => {
  await deleteDoc(doc(db, `events/${eventId}/vendors/${vendorId}`));
};