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
 * Deeply sanitizes any object or array to remove `undefined` values,
 * which cause Firestore's setDoc to fail with "Unsupported field value: undefined".
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeForFirestore(value);
    }
  }
  return cleaned as T;
}

/**
 * Save application state directly to Firebase Firestore
 */
export async function saveToFirestore(roomId: string, data: AppSyncData): Promise<boolean> {
  if (!roomId) return false;
  try {
    const rawPayload = {
      roomId,
      tasks: data.tasks || [],
      transactions: data.transactions || [],
      taskCategories: data.taskCategories || [],
      financeCategories: data.financeCategories || [],
      monthlyBudget: data.monthlyBudget || { totalBudget: 0, categoryBudgets: {}, alertThresholdPercent: 80 },
      voiceSettings: data.voiceSettings || {},
      notifications: data.notifications || [],
      theme: data.theme || 'light',
      lastUpdated: data.lastUpdated || Date.now(),
      updatedAt: new Date().toISOString(),
    };

    // Deep sanitize to guarantee no `undefined` values reach setDoc
    const sanitizedPayload = sanitizeForFirestore(rawPayload);

    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await setDoc(roomRef, sanitizedPayload, { merge: true });
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

