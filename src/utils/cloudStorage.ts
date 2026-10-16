import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import { PlayerProfile, WorkoutRecord, Badge, INITIAL_BADGES } from '../types/training';
import { CalendarCustomEvent } from './storage';

export interface CloudPlayerData {
  profile: PlayerProfile;
  workouts: WorkoutRecord[];
  badgeMap: Record<string, string>; // badgeId -> unlockedAt ISO string
  calendarEvents: CalendarCustomEvent[];
  updatedAt?: unknown; // Firestore server timestamp
}

/**
 * Load all player data from Firestore for a given uid.
 * Returns null if no data exists yet.
 */
export async function loadFromCloud(uid: string): Promise<CloudPlayerData | null> {
  const ref = doc(db, 'players', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as CloudPlayerData;
}

/**
 * Save all player data to Firestore for a given uid.
 */
export async function saveToCloud(uid: string, data: Omit<CloudPlayerData, 'updatedAt'>): Promise<void> {
  const ref = doc(db, 'players', uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Listen for real-time cloud changes from other devices.
 */
export function subscribeToCloud(
  uid: string,
  onData: (data: CloudPlayerData) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ref = doc(db, 'players', uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as CloudPlayerData);
      }
    },
    (err) => {
      console.error('[cloudStorage] onSnapshot error:', err);
      if (onError) onError(err);
    }
  );
}


/**
 * Convert raw badge map (id -> unlockedAt) into Badge[] for the UI.
 */
export function hydrateBadges(badgeMap: Record<string, string>): Badge[] {
  return INITIAL_BADGES.map(badge => ({
    ...badge,
    unlockedAt: badgeMap[badge.id] || undefined,
  }));
}
