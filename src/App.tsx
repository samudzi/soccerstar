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
  clearAllData 
} from './utils/storage';
import { sound } from './utils/sound';
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
  Flame, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  FileText
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(getPlayerProfile());
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>(getWorkouts());
  const [badges, setBadges] = useState<Badge[]>(getBadges());
  const [customEvents, setCustomEvents] = useState(getCalendarCustomEvents());
  
  // Navigation tabs: 'calendar' | 'drills' | 'badges'
  const [activeTab, setActiveTab] = useState<'calendar' | 'drills' | 'badges'>('calendar');

  // Active workout runner state
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<TrainingDay | null>(null);

  // Modals
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isParentGuideOpen, setIsParentGuideOpen] = useState(false);
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  // Seed sample data on initial visit if empty, so the user instantly sees the calendar & streaks
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
  };

  const handleResetData = () => {
    if (confirm('Reset all progress and start fresh with empty logs?')) {
      clearAllData();
      refreshAllData();
    }
  };

  const handleLoadSample = () => {
    populateSampleData();
    refreshAllData();
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
        onProfileUpdated={updated => setProfile(updated)}
      />

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
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
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
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Homework Drills & Cones</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setIsBadgesModalOpen(true);
            }}
            className="py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Trophy Showcase</span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px]">
              {unlockedBadgesCount}
            </span>
          </button>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'calendar' && (
          <VisualCalendar
            workouts={workouts}
            onStartDayWorkout={dayId => handleStartWorkout(dayId)}
            onRefreshData={refreshAllData}
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
              className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
              title="Populate test training data"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to Sample Schedule</span>
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={handleResetData}
              className="text-slate-300 hover:text-rose-400 transition-colors"
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
