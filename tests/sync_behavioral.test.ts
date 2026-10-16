import { 
  mergeWorkouts, 
  mergeBadgeMaps, 
  mergeCalendarEvents, 
  mergeProfiles,
  getBadgeMap,
  saveBadgeMap,
  unlockBadge,
  getBadges
} from '../src/utils/storage';
import { WorkoutRecord, PlayerProfile } from '../src/types/training';

// Simple in-memory localStorage polyfill for test environment
const mockStore: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (key: string) => mockStore[key] || null,
  setItem: (key: string, val: string) => { mockStore[key] = val; },
  removeItem: (key: string) => { delete mockStore[key]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); },
  key: (i: number) => Object.keys(mockStore)[i] || null,
  length: 0
};

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${msg}`);
  }
}

console.log('Running Behavioral Tests for Multi-Device Sync...');

// BS-1: Badge Map Persistence
console.log('Testing BS-1: Badge Map Persistence...');
saveBadgeMap({ 'badge-first-step': '2026-10-10T12:00:00.000Z' });
const loadedMap = getBadgeMap();
assert(loadedMap['badge-first-step'] === '2026-10-10T12:00:00.000Z', 'BS-1: getBadgeMap retrieves saved timestamp');

const allBadges = getBadges();
const firstStep = allBadges.find(b => b.id === 'badge-first-step');
assert(firstStep !== undefined && firstStep.unlockedAt === '2026-10-10T12:00:00.000Z', 'BS-1: getBadges hydrates unlockedAt');

// BS-2: Workout Deduplication & Ordering
console.log('Testing BS-2: Workout Deduplication & Ordering...');
const cloudWorkouts: WorkoutRecord[] = [
  {
    id: 'w-1',
    date: '2026-10-10',
    dayId: 'day-1',
    dayTitle: 'Day 1',
    completedDrillIds: ['d1'],
    totalDrills: 1,
    durationMinutes: 15,
    completedAt: '2026-10-10T10:00:00.000Z',
    xpEarned: 200,
  },
  {
    id: 'w-2',
    date: '2026-10-12',
    dayId: 'day-2',
    dayTitle: 'Day 2',
    completedDrillIds: ['d2'],
    totalDrills: 1,
    durationMinutes: 15,
    completedAt: '2026-10-12T10:00:00.000Z',
    xpEarned: 200,
  }
];

const localWorkouts: WorkoutRecord[] = [
  {
    id: 'w-2', // Duplicate from Device 1
    date: '2026-10-12',
    dayId: 'day-2',
    dayTitle: 'Day 2',
    completedDrillIds: ['d2'],
    totalDrills: 1,
    durationMinutes: 15,
    completedAt: '2026-10-12T10:00:00.000Z',
    xpEarned: 200,
  },
  {
    id: 'w-3', // Offline on Device 2
    date: '2026-10-14',
    dayId: 'day-3',
    dayTitle: 'Day 3',
    completedDrillIds: ['d3'],
    totalDrills: 1,
    durationMinutes: 15,
    completedAt: '2026-10-14T10:00:00.000Z',
    xpEarned: 200,
  }
];

const mergedWorkouts = mergeWorkouts(cloudWorkouts, localWorkouts);
assert(mergedWorkouts.length === 3, `BS-2: Expected 3 unique workouts, got ${mergedWorkouts.length}`);
assert(mergedWorkouts[0].id === 'w-3', 'BS-2: Most recent workout is first');
assert(mergedWorkouts[2].id === 'w-1', 'BS-2: Oldest workout is last');

// BS-3: Badge Union Merging
console.log('Testing BS-3: Badge Union Merging...');
const cloudBadges = {
  'badge-first-step': '2026-10-10T10:00:00.000Z',
  'badge-step-master': '2026-10-11T10:00:00.000Z',
};
const localBadges = {
  'badge-step-master': '2026-10-09T10:00:00.000Z', // unlocked earlier locally
  'badge-turbo-pace': '2026-10-12T10:00:00.000Z',
};

const mergedBadges = mergeBadgeMaps(cloudBadges, localBadges);
assert(mergedBadges['badge-first-step'] === '2026-10-10T10:00:00.000Z', 'BS-3: Preserves cloud-only badge');
assert(mergedBadges['badge-turbo-pace'] === '2026-10-12T10:00:00.000Z', 'BS-3: Preserves local-only badge');
assert(mergedBadges['badge-step-master'] === '2026-10-09T10:00:00.000Z', 'BS-3: Retains earliest unlock timestamp');

// BS-4: Non-Destructive Profile Merging
console.log('Testing BS-4: Non-Destructive Profile Merging...');
const defaultDevice2Profile: PlayerProfile = {
  name: 'Leo',
  jerseyNumber: 10,
  position: 'Attacking Midfielder / Winger',
  favoriteTeam: 'Real Madrid',
  favoriteColor: 'emerald',
  avatarIcon: '⚡',
  level: 1,
  currentXp: 0,
};

const activeCloudProfile: PlayerProfile = {
  name: 'Sammy',
  jerseyNumber: 7,
  position: 'Striker / Forward',
  favoriteTeam: 'Arsenal',
  favoriteColor: 'red',
  avatarIcon: '🔥',
  level: 3,
  currentXp: 850,
};

const mergedProfile = mergeProfiles(activeCloudProfile, defaultDevice2Profile);
assert(mergedProfile.name === 'Sammy', 'BS-4: Keeps cloud player name');
assert(mergedProfile.currentXp === 850, 'BS-4: Keeps cloud XP');
assert(mergedProfile.avatarIcon === '🔥', 'BS-4: Keeps cloud avatar');

console.log('ALL BEHAVIORAL TESTS PASSED SUCCESSFULLY! ✅');
