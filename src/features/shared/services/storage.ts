// src/features/shared/services/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const storage = getStorage();

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param path The storage path (e.g., 'events/images')
 * @returns Promise<string> Download URL
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type');
    }
  
    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File too large (max 10MB)');
    }
  
    const fileExtension = file.name.split('.').pop();
    const filename = `${path}/${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  }
  
/**
 * Deletes a file from Firebase Storage
 * @param url The file URL to delete
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Extracts the file path from a Firebase Storage URL
 */
export function getFilePathFromUrl(url: string): string {
  const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
  const startIdx = url.indexOf(baseUrl) + baseUrl.length;
  const endIdx = url.indexOf('?');
  return url.substring(startIdx, endIdx).replace(/%2F/g, '/');
}