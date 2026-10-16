import { 
  mergeWorkouts, 
  mergeBadgeMaps, 
  mergeCalendarEvents, 
  mergeProfiles,
  getBadgeMap,
  saveBadgeMap,
  unlockBadge,
  getBadges,
  recordMatchDay,
  recordCompletedWorkout
} from '../src/utils/storage';
import { WorkoutRecord, PlayerProfile, MatchStats } from '../src/types/training';

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

console.log('Running Behavioral Tests for Multi-Device Sync & Season Badges...');

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
    id: 'w-2',
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
    id: 'w-3',
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
  'badge-step-master': '2026-10-09T10:00:00.000Z',
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

// BS-12: Match Accomplishment Badges & Logging
console.log('Testing BS-12: Match Accomplishment Badges & Logging...');
const matchStats: MatchStats = {
  goals: 2,
  assists: 1,
  tackles: 3,
  successfulDribbles: 3,
  passesCompleted: 12,
  crosses: 2,
  cleanSheet: true
};

const matchResult = recordMatchDay('2026-10-18', matchStats, 'Great Saturday game!');
assert(matchResult.event.type === 'match-day', 'BS-12: Creates match-day event');
assert(matchResult.event.matchStats?.goals === 2, 'BS-12: Records 2 goals');
const badgeIds = matchResult.newlyUnlockedBadges.map(b => b.id);
assert(badgeIds.includes('badge-first-goal'), 'BS-12: Unlocks First Match Goal');
assert(badgeIds.includes('badge-match-brace'), 'BS-12: Unlocks Match Brace (2 goals)');
assert(badgeIds.includes('badge-playmaker-assist'), 'BS-12: Unlocks Playmaker Assist');
assert(badgeIds.includes('badge-take-on-master'), 'BS-12: Unlocks 1v1 Take-On Master (3+ dribbles)');
assert(badgeIds.includes('badge-defensive-anchor'), 'BS-12: Unlocks Defensive Anchor (3+ tackles)');
assert(badgeIds.includes('badge-clean-sheet'), 'BS-12: Unlocks Clean Sheet Shield');

// BS-13 & BS-14: Season Milestones & Real-World Rewards
console.log('Testing BS-13 & BS-14: Season Milestones & Parent Rewards...');
// Fast-forward by logging workouts up to milestone thresholds
let latestWorkoutResult;
for (let i = 1; i <= 5; i++) {
  latestWorkoutResult = recordCompletedWorkout('day-1', ['day1-drill1'], `Session ${i}`, 5, `2026-10-${10 + i}`);
}
const unlockedMapAfter5 = getBadgeMap();
assert(!!unlockedMapAfter5['reward-movie-night'], 'BS-14: 5 workouts unlocks Friday Movie Night voucher');

console.log('ALL BEHAVIORAL TESTS PASSED SUCCESSFULLY! ✅');
