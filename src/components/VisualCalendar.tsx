import React, { useState } from 'react';
import { WorkoutRecord, TRAINING_PROGRAM, Badge, MatchStats } from '../types/training';
import { CalendarCustomEvent, saveCalendarCustomEvents, getCalendarCustomEvents, recordMatchDay } from '../utils/storage';
import { sound } from '../utils/sound';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  CheckCircle2, 
  Plus, 
  Star, 
  X,
  Target,
  Trophy,
  Shield,
  Zap,
  Award
} from 'lucide-react';

interface VisualCalendarProps {
  workouts: WorkoutRecord[];
  onStartDayWorkout: (dayId: string, dateStr?: string) => void;
  onRefreshData: () => void;
  streak: number;
  weekHomeworkCount: number;
  weekGoalTarget: number;
  weekTeamPracticeCount: number;
  onMatchCompleted?: (newBadges: Badge[]) => void;
}

export const VisualCalendar: React.FC<VisualCalendarProps> = ({
  workouts,
  onStartDayWorkout,
  onRefreshData,
  streak,
  weekHomeworkCount,
  weekGoalTarget,
  weekTeamPracticeCount,
  onMatchCompleted,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [customEvents, setCustomEvents] = useState<CalendarCustomEvent[]>(getCalendarCustomEvents());

  // Match Day Logger Modal state
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchDate, setMatchDate] = useState<string>('');
  const [matchGoals, setMatchGoals] = useState(0);
  const [matchAssists, setMatchAssists] = useState(0);
  const [matchTackles, setMatchTackles] = useState(0);
  const [matchDribbles, setMatchDribbles] = useState(0);
  const [matchPasses, setMatchPasses] = useState(0);
  const [matchCrosses, setMatchCrosses] = useState(0);
  const [matchCleanSheet, setMatchCleanSheet] = useState(false);
  const [matchNotes, setMatchNotes] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    sound.playClick();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    sound.playClick();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    sound.playClick();
    setCurrentDate(new Date());
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  const todayStr = new Date().toISOString().split('T')[0];

  const getDayWorkouts = (dateStr: string) => {
    return workouts.filter(w => w.date === dateStr);
  };

  const getDayCustomEvents = (dateStr: string) => {
    return customEvents.filter(e => e.date === dateStr);
  };

  const handleAddCustomEvent = (dateStr: string, type: 'team-practice' | 'rest-day' | 'match-day') => {
    sound.playClick();
    if (type === 'match-day') {
      setMatchDate(dateStr);
      setMatchGoals(0);
      setMatchAssists(0);
      setMatchTackles(0);
      setMatchDribbles(0);
      setMatchPasses(0);
      setMatchCrosses(0);
      setMatchCleanSheet(false);
      setMatchNotes('');
      setIsMatchModalOpen(true);
      return;
    }

    const titles = {
      'team-practice': 'Team Practice (2x/week)',
      'rest-day': 'Rest & Recovery',
      'match-day': 'Weekend Match Day 🏆',
    };
    const newEvent: CalendarCustomEvent = {
      date: dateStr,
      type,
      title: titles[type],
    };
    const updated = [...customEvents.filter(e => !(e.date === dateStr && e.type === type)), newEvent];
    setCustomEvents(updated);
    saveCalendarCustomEvents(updated);
    onRefreshData();
  };

  const handleSaveMatchPerformance = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playCelebration();

    const stats: MatchStats = {
      goals: matchGoals,
      assists: matchAssists,
      tackles: matchTackles,
      successfulDribbles: matchDribbles,
      passesCompleted: matchPasses,
      crosses: matchCrosses,
      cleanSheet: matchCleanSheet,
    };

    const result = recordMatchDay(matchDate, stats, matchNotes);
    setCustomEvents(getCalendarCustomEvents());
    setIsMatchModalOpen(false);
    onRefreshData();

    if (result.newlyUnlockedBadges.length > 0 && onMatchCompleted) {
      onMatchCompleted(result.newlyUnlockedBadges);
    }
  };

  const handleRemoveCustomEvent = (dateStr: string, type: string) => {
    sound.playClick();
    const updated = customEvents.filter(e => !(e.date === dateStr && e.type === type));
    setCustomEvents(updated);
    saveCalendarCustomEvents(updated);
    onRefreshData();
  };

  const selectedWorkouts = selectedDateStr ? getDayWorkouts(selectedDateStr) : [];
  const selectedCustomEvents = selectedDateStr ? getDayCustomEvents(selectedDateStr) : [];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
      {/* Top Header: Streak & Weekly Progress */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Training Schedule & Streaks
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
              3 Homework + 2 Practices / Wk
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Visual Practice Calendar</h2>
        </div>

        {/* Badges / Goals at a glance */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Streak */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Active Streak
              </div>
              <div className="text-lg font-black text-white font-mono leading-none">
                {streak} Day{streak === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Current Week Goal Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                This Week Homework
              </div>
              <div className="text-lg font-black text-white font-mono leading-none flex items-center gap-1.5">
                <span>{weekHomeworkCount}/{weekGoalTarget}</span>
                {weekHomeworkCount >= weekGoalTarget && (
                  <span className="text-xs text-amber-300">⭐ Done</span>
                )}
              </div>
            </div>
          </div>

          {/* Team Practice Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-blue-950/40 border border-blue-500/40 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                Team Practices
              </div>
              <div className="text-lg font-black text-white font-mono leading-none">
                {weekTeamPracticeCount}/2
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls: Month Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-lg sm:text-xl font-black text-white">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleGoToday}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: totalCells }).map((_, index) => {
          let dayNumber: number;
          let isCurrentMonth = true;
          let cellDate: Date;

          if (index < firstDayIndex) {
            dayNumber = prevMonthDays - firstDayIndex + index + 1;
            isCurrentMonth = false;
            cellDate = new Date(year, month - 1, dayNumber);
          } else if (index >= firstDayIndex + daysInMonth) {
            dayNumber = index - (firstDayIndex + daysInMonth) + 1;
            isCurrentMonth = false;
            cellDate = new Date(year, month + 1, dayNumber);
          } else {
            dayNumber = index - firstDayIndex + 1;
            cellDate = new Date(year, month, dayNumber);
          }

          const isoStr = cellDate.toISOString().split('T')[0];
          const isToday = isoStr === todayStr;
          const isSelected = isoStr === selectedDateStr;

          const dayWorkouts = getDayWorkouts(isoStr);
          const dayCustomEvents = getDayCustomEvents(isoStr);
          const hasHomework = dayWorkouts.length > 0;
          const hasTeamPractice = dayCustomEvents.some(e => e.type === 'team-practice');
          const hasMatch = dayCustomEvents.some(e => e.type === 'match-day');
          const hasRest = dayCustomEvents.some(e => e.type === 'rest-day');

          return (
            <div
              key={index}
              onClick={() => {
                sound.playClick();
                setSelectedDateStr(isoStr);
              }}
              className={`min-h-[75px] sm:min-h-[92px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'ring-2 ring-emerald-400 bg-emerald-950/50 border-emerald-500/80 shadow-lg'
                  : isToday
                  ? 'border-emerald-500/70 bg-slate-900 shadow-md shadow-emerald-950/40'
                  : isCurrentMonth
                  ? 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900/60'
                  : 'border-slate-900/40 bg-slate-950/30 opacity-40 hover:opacity-75'
              }`}
            >
              {/* Day Number and Today Indicator */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-black font-mono ${
                    isToday
                      ? 'w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold'
                      : isCurrentMonth
                      ? 'text-slate-200'
                      : 'text-slate-600'
                  }`}
                >
                  {dayNumber}
                </span>

                {isToday && (
                  <span className="hidden sm:inline-block text-[9px] uppercase font-black text-emerald-400">
                    Today
                  </span>
                )}
              </div>

              {/* Event Tags & Indicators */}
              <div className="space-y-1 mt-1">
                {hasHomework && (
                  <div className="px-1.5 py-0.5 rounded-lg bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[10px] font-black truncate flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate hidden sm:inline">
                      {dayWorkouts[0].dayTitle.split(':')[0]}
                    </span>
                    <span className="sm:hidden">⚽</span>
                  </div>
                )}

                {hasTeamPractice && (
                  <div className="px-1.5 py-0.5 rounded-lg bg-blue-500/25 border border-blue-400/40 text-blue-200 text-[10px] font-bold truncate flex items-center gap-1">
                    <span>🛡️</span>
                    <span className="truncate hidden sm:inline">Practice</span>
                  </div>
                )}

                {hasMatch && (
                  <div className="px-1.5 py-0.5 rounded-lg bg-amber-500/25 border border-amber-400/40 text-amber-200 text-[10px] font-bold truncate flex items-center gap-1">
                    <span>🏆</span>
                    <span className="truncate hidden sm:inline">Match</span>
                  </div>
                )}

                {hasRest && (
                  <div className="px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-medium truncate flex items-center gap-1">
                    <span>💤</span>
                    <span className="truncate hidden sm:inline">Rest</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Date Detail Drawer / Modal Overlay */}
      {selectedDateStr && (
        <div className="mt-6 p-4 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                Selected Day Details
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>

            <button
              onClick={() => setSelectedDateStr(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Logged Activities for this date */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                Logged Activities:
              </div>

              {selectedWorkouts.length === 0 && selectedCustomEvents.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                  No sessions logged for this day yet. Choose an action on the right to start training or log a match!
                </div>
              ) : (
                <>
                  {selectedWorkouts.map(w => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                          ⚽
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-white">{w.dayTitle}</div>
                          <div className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                            <span>⏱️ {w.durationMinutes}m</span>
                            <span>•</span>
                            <span className="text-emerald-300 font-bold">+{w.xpEarned} XP</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{w.rating || 5}/5</span>
                      </div>
                    </div>
                  ))}

                  {selectedCustomEvents.map((evt, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {evt.type === 'team-practice' ? '🛡️' : evt.type === 'match-day' ? '🏆' : '💤'}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white">{evt.title}</div>
                          {evt.notes && <div className="text-xs text-slate-300">{evt.notes}</div>}
                          {evt.matchStats && (
                            <div className="text-[11px] text-amber-300 font-semibold mt-0.5 flex flex-wrap gap-2">
                              <span>⚽ {evt.matchStats.goals} Goals</span>
                              <span>👟 {evt.matchStats.assists} Assists</span>
                              <span>🛡️ {evt.matchStats.tackles} Tackles</span>
                              {evt.matchStats.cleanSheet && <span>🧤 Clean Sheet</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCustomEvent(selectedDateStr, evt.type)}
                        className="px-2.5 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-bold transition-colors"
                        title="Remove event"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Right: Quick Actions to add or start workout */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                Log or Start Activity:
              </div>

              {/* Start Homework Session */}
              <div className="grid grid-cols-2 gap-2">
                {TRAINING_PROGRAM.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedDateStr(null);
                      onStartDayWorkout(p.id, selectedDateStr);
                    }}
                    className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/50 text-left text-xs transition-all hover:scale-[1.02]"
                  >
                    <div className="font-extrabold text-white truncate text-sm">Day {p.dayNumber}</div>
                    <div className="text-xs text-emerald-200 truncate">{p.theme}</div>
                  </button>
                ))}
              </div>

              {/* Mark as Team Practice or Match */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAddCustomEvent(selectedDateStr, 'team-practice')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-950/70 hover:bg-blue-900/90 border border-blue-400/60 text-xs font-extrabold text-blue-100 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Team Practice</span>
                </button>
                <button
                  onClick={() => handleAddCustomEvent(selectedDateStr, 'match-day')}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-950/70 hover:bg-amber-900/90 border border-amber-400/60 text-xs font-extrabold text-amber-100 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>+ Match Day</span>
                </button>
                <button
                  onClick={() => handleAddCustomEvent(selectedDateStr, 'rest-day')}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors"
                >
                  💤 Rest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Match Day Performance Modal */}
      {isMatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsMatchModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25">
                🏆
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Log Match Performance</h3>
                <p className="text-xs text-slate-300">
                  Record goals, assists, and defensive feats to unlock match badges!
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveMatchPerformance} className="space-y-4 pt-3">
              {/* Stepper Counters Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Goals */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">⚽ Goals</div>
                    <div className="text-xl font-mono font-black text-white">{matchGoals}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatchGoals(Math.max(0, matchGoals - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchGoals(matchGoals + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Assists */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">👟 Assists</div>
                    <div className="text-xl font-mono font-black text-white">{matchAssists}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatchAssists(Math.max(0, matchAssists - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchAssists(matchAssists + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Dribbles */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">⚡ 1v1 Dribbles</div>
                    <div className="text-xl font-mono font-black text-white">{matchDribbles}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatchDribbles(Math.max(0, matchDribbles - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchDribbles(matchDribbles + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tackles */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">🛡️ Clean Tackles</div>
                    <div className="text-xl font-mono font-black text-white">{matchTackles}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatchTackles(Math.max(0, matchTackles - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchTackles(matchTackles + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Passes */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">📐 Good Passes</div>
                    <div className="text-xl font-mono font-black text-white">{matchPasses}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatchPasses(Math.max(0, matchPasses - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchPasses(matchPasses + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Crosses */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black uppercase text-amber-300">🏹 Crosses</div>
                    <div className="text-xl font-mono font-black text-white">{matchCrosses}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMatchCrosses(Math.max(0, matchCrosses - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-base"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchCrosses(matchCrosses + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean sheet toggle */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:bg-slate-950/80">
                <input
                  type="checkbox"
                  checked={matchCleanSheet}
                  onChange={e => setMatchCleanSheet(e.target.checked)}
                  className="w-5 h-5 rounded-md accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">
                  🧤 Kept a Clean Sheet (Zero goals conceded by team/defense)
                </span>
              </label>

              {/* Notes */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                  Game Notes / Highlights:
                </label>
                <input
                  type="text"
                  value={matchNotes}
                  onChange={e => setMatchNotes(e.target.value)}
                  placeholder="e.g. Scored top corner off a great through ball! Won 3-1."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Award className="w-4 h-4" /> Save & Claim Badges!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
