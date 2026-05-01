import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param file The file to upload
 * @param userId The ID of the authenticated user
 * @returns Promise<string> The download URL
 */
export async function uploadScreenshot(file: File, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const storageRef = ref(storage, `trades/${userId}/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    throw new Error('Failed to upload screenshot. Please check your permissions and try again.');
  }
}
