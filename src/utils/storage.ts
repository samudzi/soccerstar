import { Badge, INITIAL_BADGES, PlayerProfile, TRAINING_PROGRAM, WorkoutRecord, MatchStats } from '../types/training';

const PROFILE_KEY = 'soccerstar_profile_v1';
const WORKOUTS_KEY = 'soccerstar_workouts_v1';
const BADGES_KEY = 'soccerstar_badges_v1';
const CALENDAR_EVENTS_KEY = 'soccerstar_calendar_events_v1';

export interface CalendarCustomEvent {
  date: string; // YYYY-MM-DD
  type: 'team-practice' | 'rest-day' | 'match-day' | 'homework';
  title: string;
  notes?: string;
  matchStats?: MatchStats;
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
  { level: 7, title: 'World Cup Legend', minXp: 3600, maxXp: 4800 },
  { level: 8, title: 'Academy Phenom', minXp: 4800, maxXp: 6200 },
  { level: 9, title: 'Diamond Playmaker', minXp: 6200, maxXp: 7800 },
  { level: 10, title: 'Season MVP', minXp: 7800, maxXp: 9600 },
  { level: 11, title: 'Ballon d\'Or Star', minXp: 9600, maxXp: 12000 },
  { level: 12, title: 'Hall of Fame Champion', minXp: 12000, maxXp: 15000 },
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

export function getBadgeMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {};
}

export function saveBadgeMap(badgeMap: Record<string, string>): void {
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(badgeMap || {}));
  } catch {
    // Ignore
  }
}

export function getBadges(): Badge[] {
  try {
    const savedBadges = getBadgeMap();
    if (savedBadges && Object.keys(savedBadges).length > 0) {
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
    const map = getBadgeMap();
    if (!map[badgeId]) {
      map[badgeId] = new Date().toISOString();
      saveBadgeMap(map);
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}

/**
 * Merge utilities to intelligently combine cloud & local state without data loss
 */
export function mergeWorkouts(cloud: WorkoutRecord[] = [], local: WorkoutRecord[] = []): WorkoutRecord[] {
  const map = new Map<string, WorkoutRecord>();
  for (const w of local || []) {
    if (w && w.id) map.set(w.id, w);
  }
  for (const w of cloud || []) {
    if (w && w.id) map.set(w.id, w);
  }
  return Array.from(map.values()).sort((a, b) => {
    const tA = new Date(a.completedAt || a.date).getTime();
    const tB = new Date(b.completedAt || b.date).getTime();
    return tB - tA;
  });
}

export function mergeBadgeMaps(cloud: Record<string, string> = {}, local: Record<string, string> = {}): Record<string, string> {
  const merged: Record<string, string> = { ...(cloud || {}) };
  for (const [id, date] of Object.entries(local || {})) {
    if (!merged[id]) {
      merged[id] = date;
    } else {
      const cloudTime = new Date(merged[id]).getTime();
      const localTime = new Date(date).getTime();
      if (!isNaN(localTime) && (isNaN(cloudTime) || localTime < cloudTime)) {
        merged[id] = date;
      }
    }
  }
  return merged;
}

export function mergeCalendarEvents(cloud: CalendarCustomEvent[] = [], local: CalendarCustomEvent[] = []): CalendarCustomEvent[] {
  const map = new Map<string, CalendarCustomEvent>();
  for (const e of local || []) {
    if (e && e.date && e.type) map.set(`${e.date}_${e.type}`, e);
  }
  for (const e of cloud || []) {
    if (e && e.date && e.type) map.set(`${e.date}_${e.type}`, e);
  }
  return Array.from(map.values());
}

export function mergeProfiles(cloud?: PlayerProfile, local?: PlayerProfile): PlayerProfile {
  if (!cloud && !local) return DEFAULT_PROFILE;
  if (!cloud) return local!;
  if (!local) return cloud;
  const isLocalDefault = (local.currentXp === 0 || local.currentXp === 150) && local.name === 'Leo';
  if (isLocalDefault && (cloud.currentXp > 0 || cloud.name !== 'Leo')) {
    return cloud;
  }
  if ((cloud.currentXp || 0) >= (local.currentXp || 0)) {
    return { ...local, ...cloud };
  }
  return { ...cloud, ...local };
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

  // Drill Mastery Tiers (Brawl Stars & EA FC style progression)
  const wallPassCount = updatedWorkouts.filter(w => w.completedDrillIds?.includes('day2-drill1')).length;
  if (wallPassCount >= 5) tryUnlock('badge-wall-wizard-silver');
  if (wallPassCount >= 15) tryUnlock('badge-wall-wizard-gold');

  const shootingCount = updatedWorkouts.filter(w => w.completedDrillIds?.includes('day2-drill2')).length;
  if (shootingCount >= 5) tryUnlock('badge-rocket-boots-silver');
  if (shootingCount >= 15) tryUnlock('badge-rocket-boots-gold');

  // Weekly Goal & Streaks
  if (stats.weekHomeworkCount >= 3) {
    tryUnlock('badge-week-1');
  }
  if (stats.currentStreak >= 3) {
    tryUnlock('badge-streak-fire');
  }
  if (stats.currentStreak >= 7) {
    tryUnlock('badge-streak-7');
  }
  if (stats.currentStreak >= 14) {
    tryUnlock('badge-streak-14');
  }
  if (stats.currentStreak >= 30) {
    tryUnlock('badge-streak-30');
  }

  // Season Milestones (12-16 week roadmap)
  if (updatedWorkouts.length >= 12) tryUnlock('badge-month-1');
  if (updatedWorkouts.length >= 24) tryUnlock('badge-mid-season');
  if (updatedWorkouts.length >= 36) tryUnlock('badge-season-legend-36');
  if (updatedWorkouts.length >= 48) tryUnlock('badge-season-centurion-48');

  // Total Soccer Activities (Homework + Team Practice + Matches)
  if (updatedWorkouts.length + customEvents.length >= 10) {
    tryUnlock('badge-team-captain');
  }
  if (updatedWorkouts.length + customEvents.length >= 50) {
    tryUnlock('badge-half-century');
  }
  if (updatedWorkouts.length + customEvents.length >= 100) {
    tryUnlock('badge-century-club');
  }

  // Real-World Parent Reward Contracts (Brawl Pass / Season Vouchers)
  if (updatedWorkouts.length >= 5) tryUnlock('reward-movie-night');
  if (updatedWorkouts.length >= 10) tryUnlock('reward-ice-cream');
  if (updatedWorkouts.length >= 18) tryUnlock('reward-grip-socks');
  if (updatedWorkouts.length >= 28) tryUnlock('reward-matchday-feast');
  if (updatedWorkouts.length >= 40) tryUnlock('reward-championship-ball');

  return {
    workout,
    newlyUnlockedBadges,
    xpGained: totalXpGained,
  };
}

/**
 * Record a weekend competitive match performance with goals, assists, tackles, dribbles, etc.
 */
export function recordMatchDay(
  dateStr: string,
  stats: MatchStats,
  notes: string = ''
): { event: CalendarCustomEvent; newlyUnlockedBadges: Badge[]; xpGained: number } {
  const baseXP = 150;
  const statXP = (stats.goals * 60) + (stats.assists * 50) + (stats.successfulDribbles * 20) + (stats.tackles * 20);
  const totalXpGained = baseXP + statXP;

  const event: CalendarCustomEvent = {
    date: dateStr,
    type: 'match-day',
    title: stats.goals > 0 || stats.assists > 0 ? `Match Day (${stats.goals}G / ${stats.assists}A) 🏆` : 'Match Day 🏆',
    notes,
    matchStats: stats,
  };

  const existing = getCalendarCustomEvents().filter(e => !(e.date === dateStr && e.type === 'match-day'));
  const updatedEvents = [...existing, event];
  saveCalendarCustomEvents(updatedEvents);

  // Update profile XP
  const profile = getPlayerProfile();
  const newXp = profile.currentXp + totalXpGained;
  const levelInfo = calculateLevel(newXp);
  const updatedProfile: PlayerProfile = {
    ...profile,
    currentXp: newXp,
    level: levelInfo.level,
  };
  savePlayerProfile(updatedProfile);

  const workouts = getWorkouts();
  const newlyUnlockedBadges: Badge[] = [];

  const tryUnlock = (badgeId: string) => {
    const isNew = unlockBadge(badgeId);
    if (isNew) {
      const b = INITIAL_BADGES.find(x => x.id === badgeId);
      if (b) newlyUnlockedBadges.push(b);
    }
  };

  // Match Specific Badges
  if (stats.goals >= 1) tryUnlock('badge-first-goal');
  if (stats.goals >= 2) tryUnlock('badge-match-brace');
  if (stats.goals >= 3) tryUnlock('badge-match-hat-trick');
  if (stats.assists >= 1) tryUnlock('badge-playmaker-assist');
  if (stats.successfulDribbles >= 3) tryUnlock('badge-take-on-master');
  if (stats.passesCompleted >= 10) tryUnlock('badge-metronome-passer');
  if (stats.tackles >= 3) tryUnlock('badge-defensive-anchor');
  if (stats.crosses >= 2) tryUnlock('badge-pinpoint-crosser');
  if (stats.cleanSheet) tryUnlock('badge-clean-sheet');
  if (stats.goals + stats.assists >= 3) tryUnlock('badge-match-mvp');

  // Activity Milestones
  if (workouts.length + updatedEvents.length >= 10) tryUnlock('badge-team-captain');
  if (workouts.length + updatedEvents.length >= 50) tryUnlock('badge-half-century');
  if (workouts.length + updatedEvents.length >= 100) tryUnlock('badge-century-club');

  return {
    event,
    newlyUnlockedBadges,
    xpGained: totalXpGained,
  };
}

/**
 * Seed starter sample data for immediate visualization.
 * Only seeds calendar events (team practices) — no fake completed workouts,
 * so the recommended next day always starts at Day 1.
 */
export function populateSampleData(): void {
  const today = new Date();
  const formatIso = (d: Date) => d.toISOString().split('T')[0];

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

  // Only set events — do not overwrite workouts or XP so real progress is preserved
  saveCalendarCustomEvents(sampleEvents);

  // Set a fresh default profile only if one doesn't exist yet
  const existing = getPlayerProfile();
  if (existing.currentXp === 150 && existing.name === 'Leo') {
    const freshProfile: PlayerProfile = {
      name: 'Leo',
      jerseyNumber: 10,
      position: 'Attacking Midfielder',
      favoriteTeam: 'Real Madrid',
      favoriteColor: 'emerald',
      avatarIcon: '⚡',
      level: 1,
      currentXp: 0,
    };
    savePlayerProfile(freshProfile);
  }
}

export function clearAllData(): void {
  localStorage.removeItem(WORKOUTS_KEY);
  localStorage.removeItem(CALENDAR_EVENTS_KEY);
  localStorage.removeItem(BADGES_KEY);
  savePlayerProfile(DEFAULT_PROFILE);
}
