// src\features\fnb\services\fnbService.ts
import type { MenuItem, VendorInfo } from '../types/menu';
import { db } from '$lib/firebase';
import { collection, getDoc, doc, getDocs } from 'firebase/firestore';


export const getVendorInfo = async (vendorId: string): Promise<VendorInfo | null> => {
  try {
    const docRef = doc(db, 'vendors', vendorId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Vendor not found');
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.business_name || 'Unnamed Vendor',
      description: data.description || '',
      rating: data.rating || 0,
      image: data.image_url || '/images/default-vendor.jpg',
      minOrder: data.min_order || 0,
      deliveryFee: data.delivery_fee || 0
    };
  } catch (error) {
    console.error('Error fetching vendor info:', error);
    return null;
  }
};

// src/features/fnb/services/fnbService.ts
export const getVendors = async (): Promise<VendorInfo[]> => {
  try {
    const vendorsCollection = collection(db, 'vendors');
    const vendorsSnapshot = await getDocs(vendorsCollection);
    
    return vendorsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.business_name || 'Unnamed Vendor',
        description: data.description || '',
        rating: data.rating || 0,
        image: data.image_url || '/images/default-vendor.jpg',
        features: data.features || '',
        categories: data.categories || ''
      };
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
};

// Update getVendorMenu to sort by popularity
export const getVendorMenu = async (vendorId: string): Promise<MenuItem[]> => {
  try {
      const menuCollection = collection(db, 'vendors', vendorId, 'menuItems');
      const menuSnapshot = await getDocs(menuCollection);
      
      return menuSnapshot.docs.map(menuDoc => {
          const data = menuDoc.data();
          
          // Normalize categories
          const categories = Array.isArray(data.category) ? 
              data.category.map(c => c.trim()) : 
              [data.category?.trim() || 'Other'];
          
          // Normalize dietary information
          const dietaryInfo = Array.isArray(data.dietary_information) ? 
              data.dietary_information.map(d => d.trim()) : 
              (data.dietary_information ? [data.dietary_information.trim()] : []);
          
          return {
              id: menuDoc.id,
              name: data.name?.trim() || 'Unnamed Item',
              description: data.description?.trim() || '',
              price: Number(data.price) || 0,
              category: categories,
              image_url: data.image_url?.trim() || '/images/default-menu-item.jpg',
              dietary_information: dietaryInfo,
              availability: data.availability !== false,
              preparationTime: Number(data.preparationTime) || 0,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
          };
      });
  } catch (error) {
      console.error(`Error fetching menu for vendor ${vendorId}:`, error);
      return [];
  }
};