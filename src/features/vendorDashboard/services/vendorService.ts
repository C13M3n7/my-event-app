// src/features/vendorDashboard/services/vendorService.ts
import { db } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import type { MenuItem, VendorInfo } from '$features/fnb/types/menu';
import type { Order, OrderStatus } from '$features/fnb/types/order';

export const getVendorMenu = async (vendorId: string): Promise<MenuItem[]> => {
  try {
    const menuCollection = collection(db, 'vendors', vendorId, 'menuItems');
    const menuSnapshot = await getDocs(menuCollection);

    return menuSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MenuItem[];
  } catch (error) {
    console.error('Error fetching vendor menu:', error);
    throw new Error('Failed to load menu. Please try again later.');
  }
};

export const addMenuItem = async (vendorId: string, item: Omit<MenuItem, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'vendors', vendorId, 'menuItems'), {
        ...item,
        availability: item.availability ?? true,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw new Error('Failed to add menu item');
    }
  };
  
  export const updateMenuItem = async (vendorId: string, itemId: string, itemData: Partial<MenuItem>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'vendors', vendorId, 'menuItems', itemId), {
        ...itemData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw new Error('Failed to update menu item');
    }
  };
  
  export const deleteMenuItem = async (vendorId: string, itemId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'vendors', vendorId, 'menuItems', itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw new Error('Failed to delete menu item');
    }
  };