import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Badge } from '../types/training';
import { sound } from '../utils/sound';
import { Sparkles, Trophy, X } from 'lucide-react';

interface BadgeUnlockedAlertProps {
  badges: Badge[];
  onDismiss: () => void;
  onViewBadges: () => void;
}

export const BadgeUnlockedAlert: React.FC<BadgeUnlockedAlertProps> = ({
  badges,
  onDismiss,
  onViewBadges,
}) => {
  useEffect(() => {
    if (badges.length > 0) {
      sound.playCelebration();
      try {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
        });
      } catch {
        // Ignore
      }
    }
  }, [badges]);

  if (badges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 border-2 border-amber-400/60 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative animate-fade-in">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 mb-4 animate-bounce">
          🏆
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Badge Unlocked!</span>
        </div>

        <h3 className="text-2xl font-black text-white mb-4">
          Achievement Unlocked!
        </h3>

        <div className="space-y-3 mb-6">
          {badges.map(b => (
            <div
              key={b.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center gap-3.5 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shrink-0">
                {b.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-white truncate">{b.title}</h4>
                  <span className="text-xs font-black text-amber-400 font-mono">+{b.xpReward} XP</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mt-0.5">{b.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onDismiss();
              onViewBadges();
            }}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            View All Badges
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all hover:scale-105 active:scale-95"
          >
            Awesome! ⚽
          </button>
        </div>
      </div>
    </div>
  );
};
