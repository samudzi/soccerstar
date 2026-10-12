import React, { useState } from 'react';
import { WorkoutRecord, TRAINING_PROGRAM } from '../types/training';
import { CalendarCustomEvent, saveCalendarCustomEvents, getCalendarCustomEvents } from '../utils/storage';
import { sound } from '../utils/sound';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  CheckCircle2, 
  Plus, 
  Star, 
  X,
  Target
} from 'lucide-react';

interface VisualCalendarProps {
  workouts: WorkoutRecord[];
  onStartDayWorkout: (dayId: string, dateStr?: string) => void;
  onRefreshData: () => void;
  streak: number;
  weekHomeworkCount: number;
  weekGoalTarget: number;
  weekTeamPracticeCount: number;
}

export const VisualCalendar: React.FC<VisualCalendarProps> = ({
  workouts,
  onStartDayWorkout,
  onRefreshData,
  streak,
  weekHomeworkCount,
  weekGoalTarget,
  weekTeamPracticeCount,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [customEvents, setCustomEvents] = useState<CalendarCustomEvent[]>(getCalendarCustomEvents());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

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

  const formatIsoDate = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to get activities for a date
  const getDayWorkouts = (dateStr: string) => {
    return workouts.filter(w => w.date === dateStr);
  };

  const getDayCustomEvents = (dateStr: string) => {
    return customEvents.filter(e => e.date === dateStr);
  };

  const handleAddCustomEvent = (dateStr: string, type: 'team-practice' | 'rest-day' | 'match-day') => {
    sound.playClick();
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
      {/* Top Header: Streak & Weekly Progress */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Training Schedule & Streaks
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
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
                {streak} {streak === 1 ? 'Day' : 'Days'} 🔥
              </div>
            </div>
          </div>

          {/* Weekly Goal Progress */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                <span>Homework Target</span>
                {weekHomeworkCount >= weekGoalTarget && <span className="text-amber-400">⭐ Done!</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white font-mono">
                  {weekHomeworkCount} / {weekGoalTarget}
                </span>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, (weekHomeworkCount / weekGoalTarget) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls: Month Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg sm:text-xl font-black text-white">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={handleGoToday}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="py-1">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid Cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Previous Month Filler */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => {
          const prevDay = prevMonthDays - firstDayOfMonth + i + 1;
          return (
            <div
              key={`prev-${i}`}
              className="min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-2xl bg-slate-950/30 border border-slate-900 opacity-40 text-slate-600 flex flex-col justify-between select-none"
            >
              <span className="text-xs font-bold">{prevDay}</span>
            </div>
          );
        })}

        {/* Current Month Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatIsoDate(year, month, dayNum);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDateStr;

          const dayWorkouts = getDayWorkouts(dateStr);
          const dayCustom = getDayCustomEvents(dateStr);
          const hasHomework = dayWorkouts.length > 0;
          const hasPractice = dayCustom.some(e => e.type === 'team-practice');
          const hasMatch = dayCustom.some(e => e.type === 'match-day');
          const hasRest = dayCustom.some(e => e.type === 'rest-day');

          return (
            <div
              key={`day-${dayNum}`}
              onClick={() => {
                sound.playClick();
                setSelectedDateStr(dateStr);
              }}
              className={`min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'ring-2 ring-emerald-400 bg-slate-800/90 border-emerald-500'
                  : isToday
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isToday
                      ? 'w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black'
                      : 'text-slate-300'
                  }`}
                >
                  {dayNum}
                </span>

                {isToday && (
                  <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    TODAY
                  </span>
                )}
              </div>

              {/* Badges / Dots on Date */}
              <div className="flex flex-wrap gap-1 mt-1">
                {hasHomework && (
                  <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold"
                    title="Soccer Homework Completed"
                  >
                    <span>⚽</span>
                    <span className="hidden sm:inline text-[9px]">{dayWorkouts[0].dayId.replace('day-', 'D')}</span>
                  </div>
                )}

                {hasPractice && (
                  <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold"
                    title="Team Practice"
                  >
                    <span>🛡️</span>
                    <span className="hidden sm:inline text-[9px]">Team</span>
                  </div>
                )}

                {hasMatch && (
                  <div
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold"
                    title="Match Day"
                  >
                    <span>🏆</span>
                  </div>
                )}

                {hasRest && (
                  <div
                    className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]"
                    title="Rest Day"
                  >
                    <span>💤</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity text-right">
                View &rarr;
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">⚽ Homework Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-slate-300 font-medium">🛡️ Team Practice (2x/wk)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-300 font-medium">🏆 Game / Match</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          💡 Tap any day to log practices or view drill details!
        </div>
      </div>

      {/* Day Details Modal */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setSelectedDateStr(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs uppercase font-black tracking-wider text-emerald-400">
                Day Schedule Detail
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>
            </div>

            {/* List of existing activities on that day */}
            <div className="space-y-3 mb-6">
              {selectedWorkouts.length === 0 && selectedCustomEvents.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-sm">
                  No training recorded for this date yet.
                </div>
              ) : (
                <>
                  {selectedWorkouts.map(w => (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-black text-white">{w.dayTitle}</span>
                        </div>
                        <div className="text-xs text-emerald-300/80 mt-1">
                          {w.completedDrillIds.length} drills completed • {w.durationMinutes} mins • +{w.xpEarned} XP
                        </div>
                        {w.notes && (
                          <div className="mt-2 text-xs italic text-slate-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/40">
                            "{w.notes}"
                          </div>
                        )}
                      </div>
                      {w.rating && (
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: w.rating }).map((_, idx) => (
                            <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {selectedCustomEvents.map((evt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">
                          {evt.type === 'team-practice' ? '🛡️' : evt.type === 'match-day' ? '🏆' : '💤'}
                        </span>
                        <div>
                          <div className="text-sm font-bold text-white">{evt.title}</div>
                          {evt.notes && <div className="text-xs text-slate-400">{evt.notes}</div>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCustomEvent(selectedDateStr, evt.type)}
                        className="text-xs text-rose-400 hover:text-rose-300 p-1"
                        title="Remove event"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Quick Actions to add or start workout */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
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
                    className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/40 text-left text-xs text-emerald-200 transition-all hover:scale-[1.02]"
                  >
                    <div className="font-extrabold text-white truncate">Day {p.dayNumber}</div>
                    <div className="text-[10px] text-emerald-300/80 truncate">{p.theme}</div>
                  </button>
                ))}
              </div>

              {/* Mark as Team Practice or Match */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleAddCustomEvent(selectedDateStr, 'team-practice')}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/40 text-xs font-bold text-blue-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Team Practice</span>
                </button>
                <button
                  onClick={() => handleAddCustomEvent(selectedDateStr, 'match-day')}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/40 text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Match Day</span>
                </button>
                <button
                  onClick={() => handleAddCustomEvent(selectedDateStr, 'rest-day')}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  💤 Rest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
