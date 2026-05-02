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
    const fileName = `${timestamp}.jpg`;
    const storageRef = ref(storage, `trades/${userId}/${fileName}`);
    
    console.log(`Starting upload for user ${userId}, file: ${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload success, getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    throw new Error('Image upload failed');
  }
}
