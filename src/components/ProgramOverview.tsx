import React, { useState } from 'react';
import { TRAINING_PROGRAM, TrainingDay, Drill } from '../types/training';
import { PitchDiagram } from './PitchDiagram';
import { sound } from '../utils/sound';
import { 
  Play, 
  ExternalLink, 
  Timer, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ProgramOverviewProps {
  onStartDayWorkout: (dayId: string) => void;
  completedDayIds: string[];
}

export const ProgramOverview: React.FC<ProgramOverviewProps> = ({
  onStartDayWorkout,
  completedDayIds,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('day-1');
  const [expandedDrillId, setExpandedDrillId] = useState<string | null>('day1-drill1');
  const [previewVideoDrill, setPreviewVideoDrill] = useState<Drill | null>(null);

  const activeDay = TRAINING_PROGRAM.find(d => d.id === selectedDayId) || TRAINING_PROGRAM[0];

  const handleToggleDrill = (drillId: string) => {
    sound.playClick();
    setExpandedDrillId(expandedDrillId === drillId ? null : drillId);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Complete Training Syllabus
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
              Scaled for 8-Year-Olds
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Weekly Soccer Homework Drills
          </h2>
        </div>

        <button
          onClick={() => {
            sound.playWhistle(true);
            onStartDayWorkout(activeDay.id);
          }}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Start {activeDay.title.split(':')[0]}</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {TRAINING_PROGRAM.map(day => {
          const isSelected = day.id === selectedDayId;
          const isDone = completedDayIds.includes(day.id);

          return (
            <button
              key={day.id}
              onClick={() => {
                sound.playClick();
                setSelectedDayId(day.id);
                setExpandedDrillId(day.drills[0]?.id || null);
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  Day {day.dayNumber}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    ~{day.estimatedMinutes}m
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-white truncate mb-1">
                {day.theme}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {day.drills.length} Drills ({day.drills.map(d => d.title.split(' ')[0]).join(', ')})
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Day Detail Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-950/40 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
            {activeDay.title}
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            {activeDay.summary}
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Timer className="w-3.5 h-3.5 text-emerald-400" /> ~{activeDay.estimatedMinutes} Mins
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> {activeDay.drills.length} Drills
          </span>
        </div>
      </div>

      {/* Drills Accordion List */}
      <div className="space-y-4">
        {activeDay.drills.map((drill, idx) => {
          const isExpanded = expandedDrillId === drill.id;

          return (
            <div
              key={drill.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-slate-950/80 border-slate-700 shadow-xl'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Drill Header Bar */}
              <div
                onClick={() => handleToggleDrill(drill.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-sm flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400">
                      {drill.focus}
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {drill.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    {drill.dose}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Drill Details */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 pt-0 border-t border-slate-800/60 mt-1 space-y-4">
                  {/* Pitch Diagram */}
                  <div className="pt-3">
                    <PitchDiagram drill={drill} />
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold uppercase text-amber-400 mb-1">
                        Setup & Cones
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {drill.setupDescription}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-xs font-bold uppercase text-emerald-400 mb-1">
                        Execution & Technique
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {drill.actionDescription}
                      </p>
                    </div>
                  </div>

                  {/* Dosing and Coaching Cue */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black uppercase text-emerald-400">
                        Homework Dose:
                      </span>{' '}
                      <span className="text-xs sm:text-sm text-slate-200">{drill.dose}</span>
                    </div>
                    <div className="text-xs font-extrabold text-amber-300">
                      Cue: "{drill.coachingCue}"
                    </div>
                  </div>

                  {/* Video link & preview */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {drill.youtubeId && (
                        <button
                          onClick={() => setPreviewVideoDrill(drill)}
                          className="px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <span>▶ Watch Video Demo</span>
                        </button>
                      )}
                      <a
                        href={drill.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <span>Open on YouTube ({drill.sourceLabel})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="text-xs text-slate-400">
                      Equipment: {drill.equipment.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Modal if opened from overview */}
      {previewVideoDrill && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-[80%]">
                {previewVideoDrill.title}
              </h3>
              <button
                onClick={() => setPreviewVideoDrill(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${previewVideoDrill.youtubeId}?autoplay=1&rel=0`}
                title={previewVideoDrill.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Credit: {previewVideoDrill.sourceLabel}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
