import React, { useState } from 'react';
import { PlayerProfile } from '../types/training';
import { calculateLevel, savePlayerProfile } from '../utils/storage';
import { sound } from '../utils/sound';
import { 
  Flame, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Edit3, 
  Sparkles, 
  HelpCircle, 
  X, 
  Check,
  Shield
} from 'lucide-react';

interface PlayerHeaderProps {
  profile: PlayerProfile;
  streak: number;
  unlockedBadgeCount: number;
  totalBadgeCount: number;
  onOpenBadges: () => void;
  onOpenParentGuide: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  profile,
  streak,
  unlockedBadgeCount,
  totalBadgeCount,
  onOpenBadges,
  onOpenParentGuide,
  onProfileUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [jerseyNumber, setJerseyNumber] = useState(profile.jerseyNumber);
  const [position, setPosition] = useState(profile.position);
  const [favoriteTeam, setFavoriteTeam] = useState(profile.favoriteTeam);
  const [avatarIcon, setAvatarIcon] = useState(profile.avatarIcon);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const levelInfo = calculateLevel(profile.currentXp);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const updated: PlayerProfile = {
      ...profile,
      name: name.trim() || 'Soccer Star',
      jerseyNumber: Number(jerseyNumber) || 10,
      position,
      favoriteTeam,
      avatarIcon,
    };
    savePlayerProfile(updated);
    onProfileUpdated(updated);
    setIsEditing(false);
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const AVATAR_OPTIONS = ['⚽', '⚡', '🦁', '🚀', '🔥', '🐯', '🌟', '🌪️', '🦅', '🎯'];

  return (
    <>
      <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Left: Player Profile & Jersey */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer" onClick={() => setIsEditing(true)}>
              {/* Jersey Avatar Badge */}
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-950/60 transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="text-xl leading-none">{profile.avatarIcon}</div>
                  <span className="text-[10px] font-black text-emerald-400 font-mono mt-0.5">
                    #{profile.jerseyNumber}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white">
                <Edit3 className="w-2.5 h-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>{profile.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold hidden sm:inline-block">
                    {profile.position}
                  </span>
                </h1>
              </div>

              {/* Soccer Star Level & XP Bar */}
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Level {levelInfo.level}: {levelInfo.title}
                </span>

                <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                    style={{ width: `${levelInfo.percentage}%` }}
                  />
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {profile.currentXp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Right: Streak, Badges Button, Parent Guide, Sound */}
          <div className="flex items-center gap-2 sm:gap-3 self-end md:self-center">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
              <span>{streak} Day Streak</span>
            </div>

            {/* Badges Showcase Button */}
            <button
              onClick={onOpenBadges}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Trophy className="w-4 h-4 fill-slate-950" />
              <span>Badges ({unlockedBadgeCount}/{totalBadgeCount})</span>
            </button>

            {/* Parent Guide Button */}
            <button
              onClick={onOpenParentGuide}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Parent Training Guide & Coaching Cues"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Parent Guide</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                  : 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
              }`}
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-fade-in">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
              <span>Edit Player Card</span>
              <span>⭐</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Personalize your jersey, avatar, and favorite soccer details.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Choose Player Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAvatarIcon(opt)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                        avatarIcon === opt
                          ? 'bg-emerald-500/20 border-emerald-400 scale-110'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Jersey */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Jersey #
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={jerseyNumber}
                    onChange={e => setJerseyNumber(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Soccer Position
                </label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Striker / Forward">Striker / Forward ⚽</option>
                  <option value="Winger">Winger ⚡</option>
                  <option value="Attacking Midfielder">Attacking Midfielder (No. 10) 🧠</option>
                  <option value="Center Midfielder">Center Midfielder 🎯</option>
                  <option value="Defender">Defender 🛡️</option>
                  <option value="Goalkeeper">Goalkeeper 🧤</option>
                </select>
              </div>

              {/* Favorite Team */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Favorite Team / Club
                </label>
                <input
                  type="text"
                  value={favoriteTeam}
                  onChange={e => setFavoriteTeam(e.target.value)}
                  placeholder="e.g. Real Madrid, Arsenal, Barcelona..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
