import React from 'react';
import { PlayerProfile, WorkoutRecord } from '../types/training';
import { sound } from '../utils/sound';
import { X, Award, CheckCircle2, Flame, Printer } from 'lucide-react';

interface WeeklySummaryCardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  streak: number;
  weekHomeworkCount: number;
  weekGoalTarget: number;
  weekTeamPracticeCount: number;
  workouts: WorkoutRecord[];
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  isOpen,
  onClose,
  profile,
  streak,
  weekHomeworkCount,
  weekGoalTarget,
  weekTeamPracticeCount,
  workouts,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in print:bg-white print:text-black print:border-none print:shadow-none">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate / Card Header */}
        <div className="text-center pb-6 border-b border-slate-800 print:border-slate-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-3xl shadow-lg mb-3">
            ⭐
          </div>
          <div className="text-xs uppercase font-black tracking-widest text-emerald-400 print:text-emerald-700">
            Official Soccer Homework Report
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white print:text-slate-900 mt-1">
            {profile.name} • #{profile.jerseyNumber}
          </h2>
          <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
            {profile.position} • {profile.favoriteTeam}
          </p>
        </div>

        {/* Weekly Stats Grid */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center print:bg-slate-100 print:border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-600">
              Homework
            </div>
            <div className="text-2xl font-black text-emerald-400 print:text-emerald-700 font-mono mt-0.5">
              {weekHomeworkCount} / {weekGoalTarget}
            </div>
            <div className="text-[10px] text-emerald-300 print:text-emerald-600 font-semibold">
              {weekHomeworkCount >= weekGoalTarget ? '⭐ Met Target' : 'In Progress'}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center print:bg-slate-100 print:border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-600">
              Team Practices
            </div>
            <div className="text-2xl font-black text-blue-400 print:text-blue-700 font-mono mt-0.5">
              {weekTeamPracticeCount} / 2
            </div>
            <div className="text-[10px] text-blue-300 print:text-blue-600 font-semibold">
              Team Squad
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center print:bg-slate-100 print:border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-600">
              Active Streak
            </div>
            <div className="text-2xl font-black text-amber-400 print:text-amber-700 font-mono mt-0.5 flex items-center justify-center gap-1">
              <span>{streak}</span>
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div className="text-[10px] text-amber-300 print:text-amber-600 font-semibold">
              Days in a Row
            </div>
          </div>
        </div>

        {/* Coach / Parent Stamp */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 print:bg-slate-50 print:border-emerald-300 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-emerald-400 print:text-emerald-700" />
            <div>
              <div className="text-xs font-black text-emerald-300 print:text-emerald-800 uppercase tracking-wide">
                Coach & Parent Commendation
              </div>
              <div className="text-xs text-slate-300 print:text-slate-700">
                Outstanding effort on first touch deception, scanning, and power strikes!
              </div>
            </div>
          </div>
          <div className="text-xl">⚽</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
