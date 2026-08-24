import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { AppSyncData } from '../types';

const ROOMS_COLLECTION = 'rooms';

export interface FirestoreSyncStatus {
  connected: boolean;
  lastSyncedAt: number | null;
  error?: string;
}

/**
 * Save application state directly to Firebase Firestore
 */
export async function saveToFirestore(roomId: string, data: AppSyncData): Promise<boolean> {
  if (!roomId) return false;
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await setDoc(roomRef, {
      roomId,
      tasks: data.tasks,
      transactions: data.transactions,
      taskCategories: data.taskCategories,
      financeCategories: data.financeCategories,
      monthlyBudget: data.monthlyBudget,
      voiceSettings: data.voiceSettings,
      notifications: data.notifications || [],
      theme: data.theme,
      lastUpdated: Date.now(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err: any) {
    console.error('Error saving to Firestore:', err);
    return false;
  }
}

/**
 * Fetch application state once from Firebase Firestore
 */
export async function loadFromFirestore(roomId: string): Promise<Partial<AppSyncData> | null> {
  if (!roomId) return null;
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      return snap.data() as Partial<AppSyncData>;
    }
  } catch (err) {
    console.error('Error reading from Firestore:', err);
  }
  return null;
}

/**
 * Subscribe to real-time updates from Firestore
 */
export function subscribeToFirestoreRoom(
  roomId: string,
  onUpdate: (data: Partial<AppSyncData>) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  if (!roomId) return null;
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    return onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<AppSyncData>;
          onUpdate(data);
        }
      },
      (error) => {
        console.warn('Firestore real-time listener error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to subscribe to Firestore:', err);
    if (onError) onError(err);
    return null;
  }
}
