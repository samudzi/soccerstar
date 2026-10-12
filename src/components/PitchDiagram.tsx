import React from 'react';
import { Drill } from '../types/training';

interface PitchDiagramProps {
  drill: Drill;
  interactive?: boolean;
}

export const PitchDiagram: React.FC<PitchDiagramProps> = ({ drill }) => {
  const type = drill.diagramType;

  return (
    <div className="relative w-full rounded-2xl bg-emerald-900/90 border-2 border-emerald-500/40 p-4 shadow-inner overflow-hidden select-none">
      {/* Turf pattern lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Pitch boundary box markings */}
      <div className="absolute inset-2 border border-emerald-400/20 rounded-xl pointer-events-none" />

      {/* Header indicator */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Field Setup & Cone Blueprint
          </span>
        </div>
        <div className="text-[11px] font-medium text-emerald-200/80 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
          {drill.equipment.join(' • ')}
        </div>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="relative w-full h-48 sm:h-56 flex items-center justify-center">
        {type === 'three_cones_step_left' && (
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Field markers */}
            <circle cx="60" cy="100" r="4" fill="#34d399" opacity="0.4" />
            <circle cx="200" cy="100" r="4" fill="#34d399" opacity="0.4" />
            <circle cx="340" cy="50" r="4" fill="#34d399" opacity="0.4" />

            {/* Approach Path */}
            <path
              d="M 60 100 L 180 100"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeDasharray="6 4"
              fill="none"
            />
            {/* Shoulder fake right */}
            <path
              d="M 180 100 Q 195 130 190 115"
              stroke="#f87171"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              fill="none"
            />
            {/* Cut left and accelerate to exit cone */}
            <path
              d="M 190 100 C 205 90 270 50 335 50"
              stroke="#38bdf8"
              strokeWidth="3.5"
              fill="none"
              markerEnd="url(#arrow-cyan)"
            />

            {/* Cone 1: Start */}
            <g transform="translate(60, 100)">
              <polygon points="-8,10 8,10 0,-10" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
              <text x="0" y="24" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="bold">START CONE</text>
              {/* Player Icon */}
              <circle cx="-16" cy="0" r="9" fill="#10b981" />
              <text x="-16" y="3.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">🏃</text>
            </g>

            {/* Cone 2: Imaginary Defender */}
            <g transform="translate(200, 100)">
              <polygon points="-10,12 10,12 0,-12" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
              <text x="0" y="-16" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="bold">DEFENDER CONE</text>
              <text x="18" y="22" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold">⚡ Step Right Fake!</text>
            </g>

            {/* Cone 3: Exit Cone */}
            <g transform="translate(340, 50)">
              <polygon points="-8,10 8,10 0,-10" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
              <text x="0" y="24" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">EXIT & ACCELERATE</text>
            </g>

            {/* Distance annotations */}
            <text x="130" y="85" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontStyle="italic">~5 Yards</text>
            <text x="270" y="60" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">🚀 TURBO BURST</text>

            <defs>
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
              </marker>
            </defs>
          </svg>
        )}

        {type === 'straight_pace_change' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Track Line */}
            <line x1="40" y1="90" x2="360" y2="90" stroke="#34d399" strokeWidth="1.5" opacity="0.3" />

            {/* Slow dribble segment */}
            <line x1="45" y1="90" x2="140" y2="90" stroke="#fbbf24" strokeWidth="3" strokeDasharray="5 4" />
            {/* Big touch and Sprint */}
            <line x1="140" y1="90" x2="355" y2="90" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-sprint)" />

            {/* Cone 1: Start */}
            <g transform="translate(45, 90)">
              <polygon points="-7,9 7,9 0,-9" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
              <text x="0" y="24" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="bold">START</text>
              <circle cx="-16" cy="0" r="9" fill="#10b981" />
              <text x="-16" y="3.5" textAnchor="middle" fill="white" fontSize="10">🏃</text>
            </g>

            {/* Cone 2: Pace Change */}
            <g transform="translate(140, 90)">
              <polygon points="-9,11 9,11 0,-11" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
              <text x="0" y="-18" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="bold">BIG TOUCH HERE!</text>
              <circle cx="16" cy="-4" r="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="1" />
              <text x="0" y="24" textAnchor="middle" fill="#cbd5e1" fontSize="9">5 Yards</text>
            </g>

            {/* Cone 3: Finish Gate */}
            <g transform="translate(355, 90)">
              <polygon points="-7,9 7,9 0,-9" fill="#10b981" stroke="#059669" strokeWidth="1.5" />
              <text x="0" y="24" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">FINISH GATE</text>
            </g>

            {/* Pace labels */}
            <text x="90" y="75" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">🐢 Slow Dribble (1st Gear)</text>
            <text x="250" y="75" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="extrabold">⚡ 100% SPRINT (5th Gear)</text>
            <text x="250" y="115" textAnchor="middle" fill="#94a3b8" fontSize="9">15 Yards Sprint Space</text>

            <defs>
              <marker id="arrow-sprint" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
              </marker>
            </defs>
          </svg>
        )}

        {type === 'wall_passing' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Wall representation */}
            <rect x="330" y="25" width="22" height="130" rx="4" fill="#64748b" stroke="#94a3b8" strokeWidth="2" />
            <line x1="341" y1="25" x2="341" y2="155" stroke="#475569" strokeWidth="2" strokeDasharray="6 4" />
            <text x="370" y="95" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold" transform="rotate(90 370 95)">WALL / REBOUNDER</text>

            {/* Ground pass to wall */}
            <path d="M 120 75 L 320 75" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow-pass)" />
            {/* Ground rebound from wall */}
            <path d="M 320 105 L 120 105" stroke="#34d399" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#arrow-return)" />

            {/* Player position */}
            <g transform="translate(100, 90)">
              <circle cx="0" cy="0" r="14" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12">🏃</text>
              <text x="0" y="28" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">PLAYER (2-3 yds)</text>
              <text x="0" y="40" textAnchor="middle" fill="#cbd5e1" fontSize="9">Right Foot & Left Foot</text>
            </g>

            {/* Distance marker */}
            <line x1="120" y1="140" x2="325" y2="140" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />
            <text x="220" y="135" textAnchor="middle" fill="#cbd5e1" fontSize="10">2–3 Yards Space</text>
            <text x="220" y="60" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">Firm, Flat Pass ⚽</text>

            <defs>
              <marker id="arrow-pass" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
              </marker>
              <marker id="arrow-return" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
              </marker>
            </defs>
          </svg>
        )}

        {type === 'shooting_power' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Goal net on the right */}
            <rect x="350" y="30" width="16" height="120" fill="none" stroke="#f8fafc" strokeWidth="3" />
            <line x1="350" y1="30" x2="366" y2="45" stroke="#f8fafc" strokeWidth="2" />
            <line x1="350" y1="150" x2="366" y2="135" stroke="#f8fafc" strokeWidth="2" />
            <line x1="366" y1="45" x2="366" y2="135" stroke="#f8fafc" strokeWidth="2" />
            {/* Net cross lines */}
            <path d="M 350 60 L 366 70 M 350 90 L 366 95 M 350 120 L 366 120" stroke="#94a3b8" strokeWidth="1" opacity="0.6" />
            <text x="358" y="170" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">GOAL</text>

            {/* Ball at 10 yards */}
            <g transform="translate(180, 90)">
              <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
              <text x="0" y="22" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">STATIONARY BALL</text>
              <text x="0" y="34" textAnchor="middle" fill="#94a3b8" fontSize="9">10 Yards Out</text>
            </g>

            {/* Run up and strike arrow */}
            <path d="M 90 90 L 170 90" stroke="#a7f3d0" strokeWidth="2.5" strokeDasharray="5 3" />
            <path d="M 188 90 L 345 90" stroke="#f59e0b" strokeWidth="4" markerEnd="url(#arrow-shot)" />

            {/* Player run up */}
            <g transform="translate(75, 90)">
              <circle cx="0" cy="0" r="13" fill="#10b981" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12">🏃</text>
              <text x="0" y="24" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="bold">APPROACH</text>
            </g>

            {/* Technique cue */}
            <text x="260" y="70" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="extrabold">🚀 LACES STRIKE!</text>
            <text x="260" y="115" textAnchor="middle" fill="#e2e8f0" fontSize="9">Firm locked ankle & follow through</text>

            <defs>
              <marker id="arrow-shot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
            </defs>
          </svg>
        )}

        {type === 'first_touch_shooting' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Goal */}
            <rect x="360" y="40" width="14" height="100" fill="none" stroke="#f8fafc" strokeWidth="3" />
            <text x="367" y="155" textAnchor="middle" fill="#f8fafc" fontSize="9" fontWeight="bold">GOAL</text>

            {/* 3 central danger cones to avoid */}
            <g transform="translate(200, 90)">
              <polygon points="0,-16 -14,10 14,10" fill="#dc2626" opacity="0.25" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="0" cy="-16" r="4" fill="#ef4444" />
              <circle cx="-14" cy="10" r="4" fill="#ef4444" />
              <circle cx="14" cy="10" r="4" fill="#ef4444" />
              <text x="0" y="26" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">AVOID CONE ZONE</text>
            </g>

            {/* Ball roll in */}
            <path d="M 70 90 L 160 90" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4 3" />
            {/* Diagonal First Touch around cones */}
            <path d="M 160 90 Q 185 45 225 45" stroke="#38bdf8" strokeWidth="3.5" markerEnd="url(#arrow-cyan)" />
            {/* Strike from diagonal */}
            <path d="M 230 45 L 355 75" stroke="#f59e0b" strokeWidth="3.5" markerEnd="url(#arrow-shot)" />

            {/* Player start */}
            <g transform="translate(50, 90)">
              <circle cx="0" cy="0" r="12" fill="#10b981" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11">🏃</text>
              <text x="0" y="22" textAnchor="middle" fill="#a7f3d0" fontSize="9">START</text>
            </g>

            <text x="210" y="32" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">1st Touch Out & Away</text>
            <text x="290" y="55" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">2nd Touch Shoot! ⚽</text>
          </svg>
        )}

        {type === 'man_on_two_cone' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Parent Passer cone */}
            <g transform="translate(70, 120)">
              <circle cx="0" cy="0" r="14" fill="#3b82f6" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12">🧑‍🏫</text>
              <polygon points="-6,16 6,16 0,6" fill="#f97316" />
              <text x="0" y="30" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">PARENT / PASSER</text>
            </g>

            {/* Player Receiver cone */}
            <g transform="translate(290, 70)">
              <circle cx="0" cy="0" r="14" fill="#10b981" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12">🏃</text>
              <polygon points="-6,16 6,16 0,6" fill="#f97316" />
              <text x="0" y="30" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">PLAYER (RECEIVER)</text>
              {/* Scan indicator behind shoulder */}
              <path d="M 12 -5 Q 24 -15 22 -2" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" />
              <text x="32" y="-12" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">👀 SCAN!</text>
            </g>

            {/* Pass to player */}
            <path d="M 85 110 L 270 75" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow-cyan)" />
            {/* Return pass */}
            <path d="M 275 80 L 95 125" stroke="#34d399" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#arrow-return)" />

            <text x="180" y="80" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">Pass (10 yds)</text>
            <text x="180" y="125" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">Return 1st / 2nd Touch</text>
            <text x="180" y="150" textAnchor="middle" fill="#fef08a" fontSize="10">🗣️ Parent Cues: "Man On!"</text>
          </svg>
        )}

        {type === 'two_choice_xavi' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Parent Passer */}
            <g transform="translate(60, 90)">
              <circle cx="0" cy="0" r="13" fill="#3b82f6" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11">🧑‍🏫</text>
              <text x="0" y="24" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">PARENT</text>
            </g>

            {/* Pass into Player */}
            <path d="M 75 90 L 180 90" stroke="#38bdf8" strokeWidth="3" markerEnd="url(#arrow-cyan)" />

            {/* Player */}
            <g transform="translate(200, 90)">
              <circle cx="0" cy="0" r="14" fill="#10b981" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12">🏃</text>
              <text x="0" y="-18" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">PLAYER (Xavi Turn)</text>
            </g>

            {/* Choice A: "Man On" -> return */}
            <path d="M 185 96 C 140 120 110 110 75 96" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 3" markerEnd="url(#arrow-red)" />
            <text x="130" y="130" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">If "MAN ON" → Return Pass</text>

            {/* Cone Goal 1 (Top Right) */}
            <g transform="translate(330, 45)">
              <circle cx="-12" cy="0" r="4" fill="#f97316" />
              <circle cx="12" cy="0" r="4" fill="#f97316" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x="0" y="-8" textAnchor="middle" fill="#fed7aa" fontSize="9">Goal A</text>
            </g>

            {/* Cone Goal 2 (Bottom Right) */}
            <g transform="translate(330, 135)">
              <circle cx="-12" cy="0" r="4" fill="#f97316" />
              <circle cx="12" cy="0" r="4" fill="#f97316" />
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x="0" y="16" textAnchor="middle" fill="#fed7aa" fontSize="9">Goal B</text>
            </g>

            {/* Choice B: "Turn" -> turn & score */}
            <path d="M 215 85 C 240 60 280 50 318 45" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-green)" />
            <text x="270" y="32" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">If "TURN!" → Scan, Turn & Pass</text>

            <defs>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
              <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
            </defs>
          </svg>
        )}

        {type === 'aerial_toss' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Parent */}
            <g transform="translate(80, 90)">
              <circle cx="0" cy="0" r="14" fill="#3b82f6" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12">🧑‍🏫</text>
              <text x="0" y="26" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">PARENT TOSS</text>
            </g>

            {/* Arc toss path */}
            <path d="M 95 80 Q 185 20 280 75" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 3" markerEnd="url(#arrow-shot)" />
            {/* Ground return pass */}
            <path d="M 285 105 L 100 105" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#arrow-return)" />

            {/* Player */}
            <g transform="translate(300, 90)">
              <circle cx="0" cy="0" r="14" fill="#10b981" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="12">🏃</text>
              <text x="0" y="26" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="bold">PLAYER</text>
              {/* Cushion targets */}
              <text x="18" y="-12" fill="#fbbf24" fontSize="9">🪶 Foot</text>
              <text x="18" y="0" fill="#fbbf24" fontSize="9">🦵 Thigh</text>
              <text x="18" y="12" fill="#fbbf24" fontSize="9">👕 Chest</text>
            </g>

            <text x="185" y="38" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">Gentle Underhand Arc Toss 🪶</text>
            <text x="185" y="125" textAnchor="middle" fill="#34d399" fontSize="9">Cushion to grass & play ground pass back</text>
            <text x="185" y="150" textAnchor="middle" fill="#cbd5e1" fontSize="9">Distance: 4–5 Yards</text>
          </svg>
        )}

        {type === 'press_channel' && (
          <svg viewBox="0 0 400 180" className="w-full h-full">
            {/* Channel rectangle */}
            <rect x="70" y="35" width="260" height="110" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
            <text x="200" y="26" textAnchor="middle" fill="#cbd5e1" fontSize="10">10 Yards Wide × 15 Yards Long Channel</text>

            {/* Channel boundary cones */}
            <polygon points="65,40 75,40 70,30" fill="#f97316" />
            <polygon points="65,145 75,145 70,135" fill="#f97316" />
            <polygon points="325,40 335,40 330,30" fill="#f97316" />
            <polygon points="325,145 335,145 330,135" fill="#f97316" />

            {/* Parent Attacker starting with ball */}
            <g transform="translate(100, 90)">
              <circle cx="0" cy="0" r="13" fill="#ef4444" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11">🧑‍🏫</text>
              <circle cx="16" cy="0" r="4" fill="#ffffff" />
              <text x="0" y="24" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">ATTACKER</text>
            </g>

            {/* Player Defender sprinting then braking */}
            <path d="M 300 90 L 170 90" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="6 3" />
            {/* 2 yard cushion zone */}
            <line x1="140" y1="50" x2="140" y2="130" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
            <text x="140" y="145" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold">2 YD BUFFER</text>

            <g transform="translate(305, 90)">
              <circle cx="0" cy="0" r="13" fill="#10b981" />
              <text x="0" y="4" textAnchor="middle" fill="white" fontSize="11">🏃</text>
              <text x="0" y="24" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">DEFENDER</text>
            </g>

            <text x="230" y="78" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">1. Sprint to close space!</text>
            <text x="195" y="112" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">2. Slow down & stay balanced (NO lunging)</text>
          </svg>
        )}
      </div>

      {/* Legend & quick setup hint */}
      <div className="mt-3 bg-emerald-950/70 border border-emerald-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>Player</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            <span>Parent / Wall</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Cones / Target</span>
          </div>
        </div>
        <div className="text-emerald-300 font-medium">
          💡 {drill.coachingCue}
        </div>
      </div>
    </div>
  );
};
