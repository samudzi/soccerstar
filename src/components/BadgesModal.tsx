import React, { useState } from 'react';
import { Badge } from '../types/training';
import { sound } from '../utils/sound';
import { Award, Lock, CheckCircle, X, Sparkles } from 'lucide-react';

interface BadgesModalProps {
  badges: Badge[];
  isOpen: boolean;
  onClose: () => void;
  currentXp: number;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  badges,
  isOpen,
  onClose,
  currentXp,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'skills' | 'milestones' | 'streak'>('all');

  if (!isOpen) return null;

  const unlockedCount = badges.filter(b => !!b.unlockedAt).length;
  const totalCount = badges.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = badges.filter(badge => {
    if (filter === 'unlocked') return !!badge.unlockedAt;
    if (filter === 'skills') return badge.category === 'skills';
    if (filter === 'milestones') return badge.category === 'milestones';
    if (filter === 'streak') return badge.category === 'streak';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/50 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  Trophy Showcase
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black">
                  {unlockedCount} / {totalCount} Unlocked ({progressPercent}%)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Achievement Badges
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Filter Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800/80">
          {/* XP Banner */}
          <div className="mb-4 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Total Soccer XP Earned:</span>
            </div>
            <span className="text-sm font-black text-amber-400 font-mono">{currentXp} XP</span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Badges' },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'skills', label: 'Skill Drills' },
              { id: 'streak', label: 'Streaks' },
              { id: 'milestones', label: 'Milestones' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setFilter(tab.id as typeof filter);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  filter === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredBadges.map(badge => {
            const isUnlocked = !!badge.unlockedAt;

            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-slate-900 to-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/20 hover:scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-400/20 to-yellow-500/30 border-2 border-amber-400/50 text-amber-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-600 grayscale'
                      }`}
                    >
                      {badge.icon}
                    </div>

                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-white mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-400 font-mono">
                    +{badge.xpReward} XP
                  </span>

                  {isUnlocked && badge.unlockedAt ? (
                    <span className="text-[10px] text-slate-400">
                      {new Date(badge.unlockedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">Keep practicing!</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
