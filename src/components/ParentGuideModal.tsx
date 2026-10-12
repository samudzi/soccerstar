import React from 'react';
import { sound } from '../utils/sound';
import { X, Heart, Shield, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface ParentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentGuideModal: React.FC<ParentGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950/60 via-slate-900 to-emerald-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl text-blue-400">
              🧑‍🏫
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400">
                Coaching & Assistant Guide
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Parent Training Playbook
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Core Philosophy for 8-Year-Olds */}
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4">
            <h3 className="text-base font-black text-blue-200 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              Golden Rule: 15–20 Minutes of Fun & High Quality
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              At age 8, soccer homework should be brief, energetic, and positive. Three short 15–20 minute sessions per week alongside two team practices build immense technical confidence without causing burnout or fatigue.
            </p>
          </div>

          {/* Drill-Specific Parent Cues */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-3">
              Specific Drill Instructions for Parents:
            </h4>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white text-sm mb-1">
                  Day 1 • Step Right & Go Left + Pace Change
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Act like a smiling referee or stand by the defender cone. Look for the exaggerated drop of the right shoulder. When they hit cone #2 in the pace drill, encourage them to shift into <em>TURBO</em> gear!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white text-sm mb-1">
                  Day 2 • Wall Passing & Shooting Power
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Prioritize clean contact with the weaker foot over power. Count their successful passes out loud ("1, 2, 3..."). For shooting, check that their plant foot is pointed at the target and shoelaces make firm contact.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white text-sm mb-1">
                  Day 3 • Decision Making: "Man On" vs "Turn" (Xavi Drill)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Call out the cue <strong>just as you pass the ball</strong>, while it is rolling. This forces him to scan his shoulder and decide what to do <em>before</em> touching the ball! Keep passes crisp and accurate.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-bold text-white text-sm mb-1">
                  Day 4 • Aerial Tosses & Patient Defending
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toss balls underhand gently like an easy catch, so he can practice cushioning without scrambling. In the pressing drill, cheer whenever he slows down 2 yards away without diving in!
                </p>
              </div>
            </div>
          </div>

          {/* Encouragement Tips */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Pro Tips for Maximum Motivation
            </h4>
            <ul className="text-xs space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Praise effort and technique rather than just scoring: "That first touch was silky smooth!"</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Stop early if concentration drops: leaving the field wanting more is better than pushing through frustration.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Let him tap the completion buttons and watch the badges unlock to build self-ownership!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider"
          >
            Got It, Let's Train! ⚽
          </button>
        </div>
      </div>
    </div>
  );
};
