import React, { useState } from 'react';
import { Badge } from '../types/training';
import { sound } from '../utils/sound';
import { Lock, CheckCircle, X, Sparkles, Gift, Flame, Trophy, Shield } from 'lucide-react';

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
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'season' | 'match' | 'rewards' | 'skills' | 'streak'>('all');

  if (!isOpen) return null;

  const unlockedCount = badges.filter(b => !!b.unlockedAt).length;
  const totalCount = badges.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredBadges = badges.filter(badge => {
    if (filter === 'unlocked') return !!badge.unlockedAt;
    if (filter === 'season') return badge.category === 'season';
    if (filter === 'match') return badge.category === 'match';
    if (filter === 'rewards') return badge.category === 'rewards';
    if (filter === 'skills') return badge.category === 'skills';
    if (filter === 'streak') return badge.category === 'streak';
    return true;
  });

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;
    const styles: Record<string, string> = {
      bronze: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
      silver: 'bg-slate-700/50 text-slate-200 border-slate-500/60',
      gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/60',
      diamond: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60',
      legendary: 'bg-purple-500/20 text-purple-300 border-purple-400/60 animate-pulse',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wider ${styles[tier] || styles.bronze}`}>
        {tier}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  Season Trophy Showcase
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-black border border-amber-500/30">
                  {unlockedCount} / {totalCount} Unlocked ({progressPercent}%)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Season Badges & Rewards
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
            title="Close showcase"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Filter Tabs */}
        <div className="px-6 pt-4 pb-3 border-b border-slate-800/80 bg-slate-900/60">
          {/* XP Banner */}
          <div className="mb-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Total Season XP Earned:</span>
            </div>
            <span className="text-sm font-black text-amber-300 font-mono">{currentXp} XP</span>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Badges' },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              { id: 'rewards', label: 'Parent Rewards 🎁', highlight: true },
              { id: 'season', label: 'Season Road 👑' },
              { id: 'match', label: 'Match Feats ⚽' },
              { id: 'skills', label: 'Skill Drills ⚡' },
              { id: 'streak', label: 'Streaks 🔥' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setFilter(tab.id as typeof filter);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                  filter === tab.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25 scale-105'
                    : tab.highlight
                    ? 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border-emerald-500/40'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700/80'
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
            const isReward = badge.category === 'rewards';

            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                  isReward
                    ? isUnlocked
                      ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-950/40'
                      : 'bg-slate-950/60 border border-amber-500/30'
                    : isUnlocked
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

                    <div className="flex flex-col items-end gap-1">
                      {getTierBadge(badge.tier)}
                      {isUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-2">
                    {badge.description}
                  </p>

                  {/* Real-World Reward Banner */}
                  {isReward && badge.realWorldReward && (
                    <div className={`p-2.5 rounded-xl border mt-2 ${
                      isUnlocked
                        ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider mb-0.5 text-amber-300">
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>Parent Voucher Contract</span>
                      </div>
                      <div className="text-xs font-semibold">
                        {badge.realWorldReward}
                      </div>
                      {isUnlocked && (
                        <div className="mt-1 text-[10px] font-black text-emerald-300 uppercase tracking-wider">
                          ✓ Ready to claim with Mom & Dad!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-300 font-mono">
                    +{badge.xpReward} XP
                  </span>

                  {isUnlocked && badge.unlockedAt ? (
                    <span className="text-[10px] text-slate-300">
                      {new Date(badge.unlockedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Keep practicing!</span>
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
