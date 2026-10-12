import { Badge, INITIAL_BADGES, PlayerProfile, TRAINING_PROGRAM, WorkoutRecord } from '../types/training';

const PROFILE_KEY = 'soccerstar_profile_v1';
const WORKOUTS_KEY = 'soccerstar_workouts_v1';
const BADGES_KEY = 'soccerstar_badges_v1';
const CALENDAR_EVENTS_KEY = 'soccerstar_calendar_events_v1';

export interface CalendarCustomEvent {
  date: string; // YYYY-MM-DD
  type: 'team-practice' | 'rest-day' | 'match-day' | 'homework';
  title: string;
  notes?: string;
}

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Leo',
  jerseyNumber: 10,
  position: 'Attacking Midfielder / Winger',
  favoriteTeam: 'Real Madrid',
  favoriteColor: 'emerald',
  avatarIcon: '⚡',
  level: 1,
  currentXp: 150,
};

export const LEVEL_THRESHOLDS = [
  { level: 1, title: 'Rookie Striker', minXp: 0, maxXp: 300 },
  { level: 2, title: 'Cone Dribbler', minXp: 300, maxXp: 700 },
  { level: 3, title: 'Speed Demon', minXp: 700, maxXp: 1200 },
  { level: 4, title: 'Wall Technician', minXp: 1200, maxXp: 1800 },
  { level: 5, title: 'Midfield Maestro', minXp: 1800, maxXp: 2600 },
  { level: 6, title: 'Golden Boot Prodigy', minXp: 2600, maxXp: 3600 },
  { level: 7, title: 'World Cup Legend', minXp: 3600, maxXp: 5000 },
];

export function getPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return DEFAULT_PROFILE;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}

export function getWorkouts(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(WORKOUTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveWorkouts(workouts: WorkoutRecord[]): void {
  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch {
    // Ignore
  }
}

export function getCalendarCustomEvents(): CalendarCustomEvent[] {
  try {
    const raw = localStorage.getItem(CALENDAR_EVENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveCalendarCustomEvents(events: CalendarCustomEvent[]): void {
  try {
    localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Ignore
  }
}

export function getBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (raw) {
      const savedBadges: Record<string, string> = JSON.parse(raw);
      return INITIAL_BADGES.map(badge => ({
        ...badge,
        unlockedAt: savedBadges[badge.id] || undefined,
      }));
    }
  } catch {
    // fallback
  }
  return INITIAL_BADGES;
}

export function unlockBadge(badgeId: string): boolean {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    if (!map[badgeId]) {
      map[badgeId] = new Date().toISOString();
      localStorage.setItem(BADGES_KEY, JSON.stringify(map));
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

/**
 * Calculates XP level title and progress percentage
 */
export function calculateLevel(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.minXp) {
      current = t;
    }
  }
  const next = LEVEL_THRESHOLDS.find(t => t.level === current.level + 1);
  const max = next ? next.minXp : current.maxXp;
  const range = max - current.minXp;
  const progressInLevel = Math.max(0, xp - current.minXp);
  const percentage = Math.min(100, Math.round((progressInLevel / range) * 100));

  return {
    level: current.level,
    title: current.title,
    currentXp: xp,
    minXp: current.minXp,
    nextLevelXp: max,
    percentage,
  };
}

/**
 * Computes streak and current week stats
 */
export function calculateStats(workouts: WorkoutRecord[], customEvents: CalendarCustomEvent[] = []) {
  // Sort dates unique
  const dateSet = new Set<string>();
  workouts.forEach(w => dateSet.add(w.date));
  customEvents.filter(e => e.type === 'team-practice' || e.type === 'match-day').forEach(e => dateSet.add(e.date));

  const sortedDates = Array.from(dateSet).sort();

  // Streak calculation
  let streak = 0;
  const today = new Date();
  const formatIso = (d: Date) => d.toISOString().split('T')[0];

  const checkDate = new Date(today);
  const todayStr = formatIso(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatIso(yesterday);

  // If trained today or yesterday, count backwards
  let startFrom = todayStr;
  if (!dateSet.has(todayStr)) {
    if (dateSet.has(yesterdayStr)) {
      startFrom = yesterdayStr;
    } else {
      startFrom = '';
    }
  }

  if (startFrom) {
    const curr = new Date(startFrom);
    while (true) {
      const dateString = formatIso(curr);
      if (dateSet.has(dateString)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate current week sessions (Monday to Sunday)
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Mon...
  const distanceToMonday = (currentDayOfWeek + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const thisWeekHomeworks = workouts.filter(w => {
    const d = new Date(w.date + 'T00:00:00');
    return d >= monday && d <= sunday;
  });

  const thisWeekTeamPractices = customEvents.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= monday && d <= sunday && (e.type === 'team-practice' || e.type === 'match-day');
  });

  return {
    currentStreak: streak,
    totalWorkouts: workouts.length,
    weekHomeworkCount: thisWeekHomeworks.length,
    weekGoalTarget: 3, // 3 homework sessions / week
    weekTeamPracticeCount: thisWeekTeamPractices.length,
    weekTeamPracticeTarget: 2, // alongside his 2 team practices
    totalDrillsCompleted: workouts.reduce((acc, w) => acc + (w.completedDrillIds?.length || 0), 0),
  };
}

/**
 * Log a completed workout, award XP, and check for new badges!
 */
export function recordCompletedWorkout(
  dayId: string,
  completedDrillIds: string[],
  notes: string = '',
  rating: number = 5,
  dateOverride?: string
): { workout: WorkoutRecord; newlyUnlockedBadges: Badge[]; xpGained: number } {
  const trainingDay = TRAINING_PROGRAM.find(d => d.id === dayId);
  const now = new Date();
  const dateStr = dateOverride || now.toISOString().split('T')[0];

  const baseXP = 120;
  const drillsXP = completedDrillIds.length * 40;
  const totalXpGained = baseXP + drillsXP;

  const workout: WorkoutRecord = {
    id: `workout_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    date: dateStr,
    dayId,
    dayTitle: trainingDay ? trainingDay.title : 'Soccer Homework Session',
    completedDrillIds,
    totalDrills: trainingDay ? trainingDay.drills.length : completedDrillIds.length,
    durationMinutes: trainingDay ? trainingDay.estimatedMinutes : 15,
    rating,
    notes,
    completedAt: now.toISOString(),
    xpEarned: totalXpGained,
  };

  const existingWorkouts = getWorkouts();
  // Filter out any duplicate log on the same date for the same dayId to avoid double counting, or append
  const updatedWorkouts = [workout, ...existingWorkouts];
  saveWorkouts(updatedWorkouts);

  // Update Player Profile XP
  const profile = getPlayerProfile();
  const newXp = profile.currentXp + totalXpGained;
  const levelInfo = calculateLevel(newXp);
  const updatedProfile: PlayerProfile = {
    ...profile,
    currentXp: newXp,
    level: levelInfo.level,
  };
  savePlayerProfile(updatedProfile);

  // Check badges to unlock
  const customEvents = getCalendarCustomEvents();
  const stats = calculateStats(updatedWorkouts, customEvents);
  const newlyUnlockedBadges: Badge[] = [];

  const tryUnlock = (badgeId: string) => {
    const isNew = unlockBadge(badgeId);
    if (isNew) {
      const b = INITIAL_BADGES.find(x => x.id === badgeId);
      if (b) newlyUnlockedBadges.push(b);
    }
  };

  // Badge 1: First Kickoff
  if (updatedWorkouts.length >= 1) {
    tryUnlock('badge-first-step');
  }

  // Drill specific badges
  if (completedDrillIds.includes('day1-drill1')) {
    tryUnlock('badge-step-master');
  }
  if (completedDrillIds.includes('day1-drill2')) {
    tryUnlock('badge-turbo-pace');
  }
  if (completedDrillIds.includes('day2-drill1')) {
    tryUnlock('badge-wall-wizard');
  }
  if (completedDrillIds.includes('day2-drill2')) {
    tryUnlock('badge-rocket-boots');
  }
  if (completedDrillIds.includes('day3-drill2') || completedDrillIds.includes('day3-drill1')) {
    tryUnlock('badge-xavi-vision');
  }
  if (completedDrillIds.includes('day4-drill1')) {
    tryUnlock('badge-pillow-touch');
  }
  if (completedDrillIds.includes('day4-drill2')) {
    tryUnlock('badge-brick-wall');
  }

  // Weekly Hat-trick: 3 sessions in current week
  if (stats.weekHomeworkCount >= 3) {
    tryUnlock('badge-hat-trick-hero');
  }

  // Streak: 3 or more days
  if (stats.currentStreak >= 3) {
    tryUnlock('badge-streak-fire');
  }

  // 1,000 XP
  if (newXp >= 1000) {
    tryUnlock('badge-golden-boot');
  }

  // 10 total activities
  if (updatedWorkouts.length + customEvents.length >= 10) {
    tryUnlock('badge-team-captain');
  }

  return {
    workout,
    newlyUnlockedBadges,
    xpGained: totalXpGained,
  };
}

/**
 * Seed starter sample data for immediate visualization
 */
export function populateSampleData(): void {
  const today = new Date();
  const formatIso = (d: Date) => d.toISOString().split('T')[0];

  const d1 = new Date(today);
  d1.setDate(today.getDate() - 2);

  const d2 = new Date(today);
  d2.setDate(today.getDate() - 1);

  const sampleWorkouts: WorkoutRecord[] = [
    {
      id: 'sample-1',
      date: formatIso(d1),
      dayId: 'day-1',
      dayTitle: 'Day 1: Beating a Defender & Accelerating',
      completedDrillIds: ['day1-drill1', 'day1-drill2'],
      totalDrills: 2,
      durationMinutes: 16,
      rating: 5,
      notes: 'Super fast on the shoulder drop fake! Hit turbo on drill 2.',
      completedAt: d1.toISOString(),
      xpEarned: 200,
    },
    {
      id: 'sample-2',
      date: formatIso(d2),
      dayId: 'day-2',
      dayTitle: 'Day 2: Passing & Shooting',
      completedDrillIds: ['day2-drill1', 'day2-drill2', 'day2-drill3'],
      totalDrills: 3,
      durationMinutes: 20,
      rating: 5,
      notes: 'Laces strike into the top corner! 20 clean wall passes in a row.',
      completedAt: d2.toISOString(),
      xpEarned: 240,
    },
  ];

  const dPractice1 = new Date(today);
  dPractice1.setDate(today.getDate() - 3);

  const dPractice2 = new Date(today);
  dPractice2.setDate(today.getDate() + 2);

  const sampleEvents: CalendarCustomEvent[] = [
    {
      date: formatIso(dPractice1),
      type: 'team-practice',
      title: 'Team Practice (U9 Lions)',
      notes: 'Passing drills and 5v5 scrimmage.',
    },
    {
      date: formatIso(dPractice2),
      type: 'team-practice',
      title: 'Team Practice (U9 Lions)',
      notes: 'Corner kicks and match play prep.',
    },
  ];

  saveWorkouts(sampleWorkouts);
  saveCalendarCustomEvents(sampleEvents);

  const sampleProfile: PlayerProfile = {
    name: 'Leo',
    jerseyNumber: 10,
    position: 'Attacking Midfielder',
    favoriteTeam: 'Real Madrid',
    favoriteColor: 'emerald',
    avatarIcon: '⚡',
    level: 2,
    currentXp: 590,
  };
  savePlayerProfile(sampleProfile);

  // Unlock initial starter badges
  unlockBadge('badge-first-step');
  unlockBadge('badge-step-master');
  unlockBadge('badge-turbo-pace');
  unlockBadge('badge-wall-wizard');
  unlockBadge('badge-rocket-boots');
}

export function clearAllData(): void {
  localStorage.removeItem(WORKOUTS_KEY);
  localStorage.removeItem(CALENDAR_EVENTS_KEY);
  localStorage.removeItem(BADGES_KEY);
  savePlayerProfile(DEFAULT_PROFILE);
}
