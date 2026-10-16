import React, { useState, useEffect } from 'react';
import { 
  TRAINING_PROGRAM, 
  TrainingDay, 
  WorkoutRecord, 
  Badge, 
  PlayerProfile 
} from './types/training';
import { 
  getPlayerProfile, 
  getWorkouts, 
  getBadges, 
  calculateStats, 
  getCalendarCustomEvents, 
  populateSampleData, 
  clearAllData,
  savePlayerProfile,
  saveWorkouts,
  saveCalendarCustomEvents,
  getBadgeMap,
  saveBadgeMap,
  mergeWorkouts,
  mergeBadgeMaps,
  mergeCalendarEvents,
  mergeProfiles,
} from './utils/storage';
import { sound } from './utils/sound';
import { auth } from './utils/firebase';
import { loadFromCloud, saveToCloud, subscribeToCloud, CloudPlayerData } from './utils/cloudStorage';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { PlayerHeader } from './components/PlayerHeader';
import { VisualCalendar } from './components/VisualCalendar';
import { ProgramOverview } from './components/ProgramOverview';
import { BadgesModal } from './components/BadgesModal';
import { WorkoutRunner } from './components/WorkoutRunner';
import { ParentGuideModal } from './components/ParentGuideModal';
import { BadgeUnlockedAlert } from './components/BadgeUnlockedAlert';
import { WeeklySummaryCard } from './components/WeeklySummaryCard';
import { 
  Calendar as CalendarIcon, 
  BookOpen, 
  Trophy, 
  Play, 
  Sparkles, 
  RefreshCw, 
  FileText,
  LogIn,
  LogOut,
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(getPlayerProfile());
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>(getWorkouts());
  const [badges, setBadges] = useState<Badge[]>(getBadges());
  const [customEvents, setCustomEvents] = useState(getCalendarCustomEvents());
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
  // Navigation tabs: 'calendar' | 'drills' | 'badges'
  const [activeTab, setActiveTab] = useState<'calendar' | 'drills' | 'badges'>('calendar');

  // Active workout runner state
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<TrainingDay | null>(null);

  // Modals
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isParentGuideOpen, setIsParentGuideOpen] = useState(false);
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  // Listen for auth state changes and subscribe to real-time cloud updates
  useEffect(() => {
    let cloudUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (cloudUnsub) {
        cloudUnsub();
        cloudUnsub = null;
      }

      if (firebaseUser) {
        setSyncing(true);
        setSyncError(null);

        try {
          // 1. Initial fetch from cloud
          const cloudData = await loadFromCloud(firebaseUser.uid);

          const localWorkouts = getWorkouts();
          const localProfile = getPlayerProfile();
          const localBadges = getBadgeMap();
          const localEvents = getCalendarCustomEvents();

          if (cloudData) {
            // Non-destructively merge cloud and local data
            const mergedWorkouts = mergeWorkouts(cloudData.workouts, localWorkouts);
            const mergedProfile = mergeProfiles(cloudData.profile, localProfile);
            const mergedBadges = mergeBadgeMaps(cloudData.badgeMap, localBadges);
            const mergedEvents = mergeCalendarEvents(cloudData.calendarEvents, localEvents);

            savePlayerProfile(mergedProfile);
            saveWorkouts(mergedWorkouts);
            saveBadgeMap(mergedBadges);
            saveCalendarCustomEvents(mergedEvents);
            refreshAllData();

            // Push merged data back to ensure cloud has the latest complete state
            await saveToCloud(firebaseUser.uid, {
              profile: mergedProfile,
              workouts: mergedWorkouts,
              badgeMap: mergedBadges,
              calendarEvents: mergedEvents,
            });
          } else {
            // First time sign-in: upload local data
            await saveToCloud(firebaseUser.uid, {
              profile: localProfile,
              workouts: localWorkouts,
              badgeMap: localBadges,
              calendarEvents: localEvents,
            });
          }

          setSyncSuccess(true);
          setTimeout(() => setSyncSuccess(false), 3000);

          // 2. Subscribe to real-time multi-device updates
          cloudUnsub = subscribeToCloud(
            firebaseUser.uid,
            (incomingData) => {
              if (!incomingData) return;
              if (incomingData.profile) savePlayerProfile(incomingData.profile);
              if (incomingData.workouts) saveWorkouts(incomingData.workouts);
              if (incomingData.badgeMap) saveBadgeMap(incomingData.badgeMap);
              if (incomingData.calendarEvents) saveCalendarCustomEvents(incomingData.calendarEvents);
              refreshAllData();
            },
            (err: any) => {
              console.error('[App] Real-time sync error:', err);
              if (err?.message && err.message.includes('permission')) {
                setSyncError('Firestore permission denied. Check your Firestore Security Rules in Firebase Console.');
              } else {
                setSyncError(err?.message || 'Real-time sync error');
              }
            }
          );
        } catch (err: any) {
          console.error('[App] Cloud sync error:', err);
          if (err?.message && err.message.includes('permission')) {
            setSyncError('Firestore permission denied. Check your Firestore Security Rules in Firebase Console.');
          } else {
            setSyncError(err?.message || 'Cloud sync failed');
          }
        } finally {
          setSyncing(false);
        }
      }
    });

    return () => {
      authUnsub();
      if (cloudUnsub) cloudUnsub();
    };
  }, []);

  // Seed sample data on initial visit if empty
  useEffect(() => {
    const existingWorkouts = getWorkouts();
    if (existingWorkouts.length === 0) {
      populateSampleData();
      setWorkouts(getWorkouts());
      setProfile(getPlayerProfile());
      setBadges(getBadges());
      setCustomEvents(getCalendarCustomEvents());
    }
  }, []);

  const refreshAllData = () => {
    setProfile(getPlayerProfile());
    setWorkouts(getWorkouts());
    setBadges(getBadges());
    setCustomEvents(getCalendarCustomEvents());
  };

  const syncToCloud = async (overrideData?: Partial<CloudPlayerData>) => {
    if (!user) return;
    try {
      setSyncing(true);
      setSyncError(null);
      const currentWorkouts = overrideData?.workouts || getWorkouts();
      const currentProfile = overrideData?.profile || getPlayerProfile();
      const currentEvents = overrideData?.calendarEvents || getCalendarCustomEvents();
      const badgeMap = overrideData?.badgeMap || getBadgeMap();

      await saveToCloud(user.uid, {
        profile: currentProfile,
        workouts: currentWorkouts,
        badgeMap,
        calendarEvents: currentEvents,
      });
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err: any) {
      console.error('[App] syncToCloud failed:', err);
      if (err?.message && err.message.includes('permission')) {
        setSyncError('Firestore permission denied. Check your Firestore Security Rules in Firebase Console.');
      } else {
        setSyncError(err?.message || 'Failed to sync with cloud');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const stats = calculateStats(workouts, customEvents);

  // Determine recommended next training day based on recent workouts
  const lastWorkout = workouts[0];
  let nextDayIndex = 0;
  if (lastWorkout && lastWorkout.dayId) {
    const currentIdx = TRAINING_PROGRAM.findIndex(d => d.id === lastWorkout.dayId);
    if (currentIdx !== -1) {
      nextDayIndex = (currentIdx + 1) % TRAINING_PROGRAM.length;
    }
  }
  const recommendedDay = TRAINING_PROGRAM[nextDayIndex];

  const handleStartWorkout = (dayId: string) => {
    const target = TRAINING_PROGRAM.find(d => d.id === dayId) || recommendedDay;
    sound.playWhistle(true);
    setActiveWorkoutDay(target);
  };

  const handleWorkoutCompleted = (unlockedBadges: Badge[]) => {
    refreshAllData();
    setActiveWorkoutDay(null);
    if (unlockedBadges.length > 0) {
      setNewlyUnlockedBadges(unlockedBadges);
    }
    // Sync to cloud after completing a workout
    syncToCloud();
  };

  const handleResetData = () => {
    if (confirm('Reset all progress and start fresh with empty logs?')) {
      clearAllData();
      refreshAllData();
      if (user) syncToCloud();
    }
  };

  const handleLoadSample = () => {
    populateSampleData();
    refreshAllData();
    if (user) syncToCloud();
  };

  const completedDayIds = Array.from(new Set(workouts.map(w => w.dayId)));
  const unlockedBadgesCount = badges.filter(b => !!b.unlockedAt).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Player Header */}
      <PlayerHeader
        profile={profile}
        streak={stats.currentStreak}
        unlockedBadgeCount={unlockedBadgesCount}
        totalBadgeCount={badges.length}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
        onOpenParentGuide={() => setIsParentGuideOpen(true)}
        onProfileUpdated={updated => {
          setProfile(updated);
          if (user) syncToCloud({ profile: updated });
        }}
      />

      {/* Auth Bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-end gap-3">
          {authLoading ? (
            <span className="text-xs text-slate-500">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              {syncing ? (
                <span className="text-xs text-emerald-400 animate-pulse">Syncing…</span>
              ) : syncSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold">Cloud Synced ✓</span>
              ) : (
                <button
                  onClick={() => syncToCloud()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 hover:text-white border border-slate-700 transition-colors shadow-sm"
                  title="Manual cloud sync"
                >
                  Sync Now
                </button>
              )}
              <div className="flex items-center gap-2">
                {user.photoURL && (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                )}
                <span className="text-xs text-slate-200 font-medium hidden sm:inline">{user.displayName || user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-xs font-bold text-slate-200 hover:text-rose-200 border border-slate-700 hover:border-rose-700/60 transition-colors shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {/* Sync Error Banner */}
      {syncError && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-300">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
            <span>⚠️ {syncError}</span>
            <button
              onClick={() => setSyncError(null)}
              className="text-amber-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}


      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Banner: Quick Start Today's Training */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl">
          {/* Pitch background lines overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Weekly Plan: 3 Sessions (15–20 Mins)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Ready for Today, <span className="text-emerald-400">{profile.name}</span>?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Next up is <strong className="text-white font-bold">{recommendedDay.title}</strong>: {recommendedDay.summary}
              </p>

              {/* Mini tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
                <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  ⏱️ ~{recommendedDay.estimatedMinutes} Minutes
                </span>
                <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  ⚽ {recommendedDay.drills.length} Fun Drills
                </span>
                <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  🔥 +200 XP
                </span>
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                onClick={() => handleStartWorkout(recommendedDay.id)}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Start Today's Workout!</span>
              </button>

              <button
                onClick={() => setIsWeeklySummaryOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Weekly Certificate & Report</span>
              </button>
            </div>
          </div>
        </section>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('calendar');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'calendar'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <span>Practice Calendar</span>
            {stats.weekHomeworkCount >= stats.weekGoalTarget && (
              <span className="hidden sm:inline text-xs text-amber-300">⭐</span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('drills');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'drills'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'text-slate-200 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Homework Drills & Cones</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsBadgesModalOpen(true);
            }}
            className="py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 text-slate-200 hover:text-amber-300 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Trophy Showcase</span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
              {unlockedBadgesCount}
            </span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'calendar' && (
          <VisualCalendar
            workouts={workouts}
            onStartDayWorkout={dayId => handleStartWorkout(dayId)}
            onRefreshData={() => {
              refreshAllData();
              if (user) syncToCloud();
            }}
            onMatchCompleted={newBadges => {
              if (newBadges.length > 0) {
                setNewlyUnlockedBadges(newBadges);
              }
            }}
            streak={stats.currentStreak}
            weekHomeworkCount={stats.weekHomeworkCount}
            weekGoalTarget={stats.weekGoalTarget}
            weekTeamPracticeCount={stats.weekTeamPracticeCount}
          />
        )}

        {activeTab === 'drills' && (
          <ProgramOverview
            onStartDayWorkout={dayId => handleStartWorkout(dayId)}
            completedDayIds={completedDayIds}
          />
        )}
      </main>

      {/* Footer & Sample Data Controls */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">⚽</span>
            <span className="font-bold text-slate-300">
              SoccerStar • Homework Companion for Young Champions
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-bold text-xs"
              title="Populate test training data"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reset to Sample Schedule</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-200 hover:text-rose-300 transition-colors text-xs font-bold"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </footer>

      {/* Active Workout Runner Fullscreen Overlay */}
      {activeWorkoutDay && (
        <WorkoutRunner
          day={activeWorkoutDay}
          onClose={() => setActiveWorkoutDay(null)}
          onComplete={newBadges => handleWorkoutCompleted(newBadges)}
        />
      )}

      {/* Badges Modal */}
      <BadgesModal
        badges={badges}
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        currentXp={profile.currentXp}
      />

      {/* Parent Guide Modal */}
      <ParentGuideModal
        isOpen={isParentGuideOpen}
        onClose={() => setIsParentGuideOpen(false)}
      />

      {/* Weekly Summary / Certificate Modal */}
      <WeeklySummaryCard
        isOpen={isWeeklySummaryOpen}
        onClose={() => setIsWeeklySummaryOpen(false)}
        profile={profile}
        streak={stats.currentStreak}
        weekHomeworkCount={stats.weekHomeworkCount}
        weekGoalTarget={stats.weekGoalTarget}
        weekTeamPracticeCount={stats.weekTeamPracticeCount}
        workouts={workouts}
      />

      {/* Newly Unlocked Badge Popup */}
      <BadgeUnlockedAlert
        badges={newlyUnlockedBadges}
        onDismiss={() => setNewlyUnlockedBadges([])}
        onViewBadges={() => {
          setNewlyUnlockedBadges([]);
          setIsBadgesModalOpen(true);
        }}
      />
    </div>
  );
}
