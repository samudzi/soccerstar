import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TrainingDay, Drill, Badge } from '../types/training';
import { PitchDiagram } from './PitchDiagram';
import { sound } from '../utils/sound';
import { recordCompletedWorkout } from '../utils/storage';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  VolumeX, 
  X, 
  Star, 
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';

interface WorkoutRunnerProps {
  day: TrainingDay;
  onClose: () => void;
  onComplete: (newBadges: Badge[], xpEarned: number) => void;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({ day, onClose, onComplete }) => {
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [drillReps, setDrillReps] = useState<Record<string, number>>({});
  const [completedDrillIds, setCompletedDrillIds] = useState<string[]>([]);
  
  // Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [isRestMode, setIsRestMode] = useState<boolean>(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(60);

  // Video embed modal or inline view
  const [showVideo, setShowVideo] = useState<boolean>(false);

  // Finishing screen
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const currentDrill = day.drills[currentDrillIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset timer when drill changes
  useEffect(() => {
    // If drill has explicit minutes (e.g. 5 minutes wall passing), set default countdown
    if (currentDrill.id === 'day2-drill1') {
      setTimerSeconds(5 * 60);
    } else if (currentDrill.id === 'day3-drill2') {
      setTimerSeconds(2 * 60); // 2-minute round
    } else {
      setTimerSeconds(0); // count up or standard reps
    }
    setTimerActive(false);
    setIsRestMode(false);
    setShowVideo(false);
  }, [currentDrillIndex]);

  // Main timer loop
  useEffect(() => {
    if (timerActive && !isRestMode) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          // If countdown mode
          if (currentDrill.id === 'day2-drill1' || currentDrill.id === 'day3-drill2') {
            if (prev <= 1) {
              sound.playWhistle();
              setTimerActive(false);
              return 0;
            }
            if (prev <= 4 && prev > 1) {
              sound.playBeep(false);
            }
            return prev - 1;
          }
          // Normal count-up stopwatch
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, isRestMode, currentDrill.id]);

  // Rest timer loop
  useEffect(() => {
    let restInterval: NodeJS.Timeout | null = null;
    if (isRestMode) {
      restInterval = setInterval(() => {
        setRestSecondsLeft(prev => {
          if (prev <= 1) {
            sound.playWhistle();
            setIsRestMode(false);
            return 60;
          }
          if (prev <= 4 && prev > 1) {
            sound.playBeep(false);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [isRestMode]);

  const handleToggleTimer = () => {
    sound.playClick();
    if (!timerActive) {
      sound.playWhistle(true);
    }
    setTimerActive(!timerActive);
  };

  const handleResetTimer = () => {
    sound.playClick();
    setTimerActive(false);
    if (currentDrill.id === 'day2-drill1') {
      setTimerSeconds(5 * 60);
    } else if (currentDrill.id === 'day3-drill2') {
      setTimerSeconds(2 * 60);
    } else {
      setTimerSeconds(0);
    }
  };

  const currentRepsCount = drillReps[currentDrill.id] || 0;

  const handleIncrementRep = () => {
    sound.playClick();
    const newCount = currentRepsCount + 1;
    setDrillReps(prev => ({ ...prev, [currentDrill.id]: newCount }));

    if (newCount === currentDrill.repsTarget) {
      sound.playCelebration();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignore
      }
    }
  };

  const handleDecrementRep = () => {
    sound.playClick();
    if (currentRepsCount > 0) {
      setDrillReps(prev => ({ ...prev, [currentDrill.id]: currentRepsCount - 1 }));
    }
  };

  const handleMarkDrillComplete = () => {
    sound.playCelebration();
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }

    if (!completedDrillIds.includes(currentDrill.id)) {
      setCompletedDrillIds(prev => [...prev, currentDrill.id]);
    }

    // If there is another drill, prompt water break or jump
    if (currentDrillIndex < day.drills.length - 1) {
      setIsRestMode(true);
      setRestSecondsLeft(45);
    } else {
      // Finished all drills in this session!
      setIsFinished(true);
      sound.playCelebration();
    }
  };

  const handleSkipRest = () => {
    sound.playClick();
    setIsRestMode(false);
    if (currentDrillIndex < day.drills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1);
    }
  };

  const handleFinishWorkout = () => {
    sound.playCelebration();
    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch {
      // Ignore
    }

    const allCompleted = Array.from(new Set([...completedDrillIds, currentDrill.id]));
    const result = recordCompletedWorkout(
      day.id,
      allCompleted,
      workoutNotes,
      rating
    );

    onComplete(result.newlyUnlockedBadges, result.xpGained);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col overflow-y-auto">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Exit workout"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Active Workout • {day.title.split(':')[0]}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {day.theme}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400'
            }`}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => sound.playWhistle()}
            className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 flex items-center gap-1.5 transition-all"
            title="Blow referee whistle"
          >
            <span>📢 Whistle</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {!isFinished ? (
          <div>
            {/* Drill Step Indicators */}
            <div className="flex items-center gap-2 mb-6">
              {day.drills.map((drill, idx) => {
                const isCurrent = idx === currentDrillIndex;
                const isDone = completedDrillIds.includes(drill.id);
                return (
                  <button
                    key={drill.id}
                    onClick={() => {
                      setCurrentDrillIndex(idx);
                      setIsRestMode(false);
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950'
                        : isDone
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">Drill {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Rest Break Screen if active */}
            {isRestMode ? (
              <div className="my-8 p-8 rounded-3xl bg-gradient-to-br from-blue-900/60 via-slate-900 to-emerald-950/60 border-2 border-blue-500/40 text-center shadow-2xl animate-fade-in">
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-4xl mb-4 animate-bounce">
                  🥤
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Catch Your Breath!</h3>
                <p className="text-blue-200 text-sm max-w-sm mx-auto mb-6">
                  Drink some water, shake out your legs, and get ready for the next drill!
                </p>

                <div className="text-5xl sm:text-6xl font-black text-amber-300 font-mono tracking-tight mb-6">
                  {restSecondsLeft}s
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSkipRest}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>I'm Ready! Next Drill</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Drill Title & Focus Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Drill {currentDrillIndex + 1} of {day.drills.length}
                    </span>
                    <div className="flex items-center gap-2">
                      {currentDrill.youtubeId && (
                        <button
                          onClick={() => setShowVideo(!showVideo)}
                          className="px-3 py-1 rounded-full text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 flex items-center gap-1.5 transition-colors"
                        >
                          <span>▶ {showVideo ? 'Hide Video' : 'Watch Video Demo'}</span>
                        </button>
                      )}
                      <a
                        href={currentDrill.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors"
                        title="Open on YouTube"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {currentDrill.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    <strong className="text-emerald-400">Focus:</strong> {currentDrill.focus}
                  </p>

                  {/* YouTube Embed if toggled */}
                  {showVideo && currentDrill.youtubeId && (
                    <div className="mb-5 rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-2xl aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${currentDrill.youtubeId}?autoplay=1&rel=0`}
                        title={currentDrill.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Visual Pitch Setup Diagram */}
                  <PitchDiagram drill={currentDrill} />

                  {/* Step by step action description */}
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                        <span>📋</span> Drill Setup
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {currentDrill.setupDescription}
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                        <span>⚡</span> How to Execute
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {currentDrill.actionDescription}
                      </p>
                    </div>
                  </div>

                  {/* Parent & Coach Tip Callout */}
                  <div className="mt-4 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
                    <div className="text-2xl select-none">🧑‍🏫</div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-blue-300">
                        Parent Helper Card
                      </div>
                      <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                        {currentDrill.parentTips || 'Give lots of encouragement and keep reps fun and high energy!'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Rep Counter & Stopwatch Section */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 shadow-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                    {/* Rep Counter */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Dose Target: {currentDrill.repsTarget} Reps
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleDecrementRep}
                          className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl flex items-center justify-center active:scale-95 transition-all"
                        >
                          -
                        </button>
                        <div className="text-center min-w-[90px]">
                          <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">
                            {currentRepsCount}
                          </span>
                          <span className="text-slate-500 text-lg font-bold"> / {currentDrill.repsTarget}</span>
                        </div>
                        <button
                          onClick={handleIncrementRep}
                          className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-emerald-950 active:scale-95 transition-all"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        Tap + after each completed rep!
                      </p>
                    </div>

                    {/* Timer / Stopwatch */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        {currentDrill.id === 'day2-drill1' || currentDrill.id === 'day3-drill2'
                          ? 'Drill Countdown'
                          : 'Practice Stopwatch'}
                      </div>
                      <div className="text-4xl sm:text-5xl font-black font-mono text-amber-300 mb-3">
                        {formatTime(timerSeconds)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleToggleTimer}
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                            timerActive
                              ? 'bg-amber-600 hover:bg-amber-500 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {timerActive ? (
                            <>
                              <Pause className="w-4 h-4" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" /> Start Timer
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleResetTimer}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Finish Drill Button */}
                  <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentDrillIndex > 0) setCurrentDrillIndex(currentDrillIndex - 1);
                        }}
                        disabled={currentDrillIndex === 0}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>
                      <button
                        onClick={() => {
                          if (currentDrillIndex < day.drills.length - 1) {
                            setCurrentDrillIndex(currentDrillIndex + 1);
                          }
                        }}
                        disabled={currentDrillIndex === day.drills.length - 1}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={handleMarkDrillComplete}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 text-slate-950" />
                      <span>Drill Finished! {currentDrillIndex === day.drills.length - 1 ? 'Complete Workout' : 'Take Rest'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Session Completed Summary & Celebration Screen */
          <div className="my-auto py-8 text-center max-w-lg mx-auto">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30 mb-6 animate-bounce">
              🏆
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-3">
              <Flame className="w-4 h-4" />
              <span>Homework Complete!</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Superstar Performance!
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              You completed all drills for <strong className="text-emerald-400">{day.title}</strong>!
            </p>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl text-left space-y-5">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  How did it feel today?
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(starNum => (
                    <button
                      key={starNum}
                      onClick={() => {
                        sound.playClick();
                        setRating(starNum);
                      }}
                      className="p-1 transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          starNum <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Player Note / Coach Reflection:
                </label>
                <input
                  type="text"
                  value={workoutNotes}
                  onChange={e => setWorkoutNotes(e.target.value)}
                  placeholder="e.g. Scored 5 laces shots! Shoulder fake was fast!"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* XP Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-200">Session XP Reward</span>
                </div>
                <span className="text-sm font-black text-emerald-300 font-mono">+200 XP</span>
              </div>
            </div>

            <button
              onClick={handleFinishWorkout}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-2xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              Save to Calendar & Unlock Badges! ⚽
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
