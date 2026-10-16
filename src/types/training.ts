export interface Drill {
  id: string;
  title: string;
  subtitle?: string;
  focus: string;
  videoUrl: string;
  youtubeId?: string;
  sourceLabel: string;
  setupDescription: string;
  actionDescription: string;
  dose: string;
  repsTarget: number;
  durationMinutes: number;
  coachingCue: string;
  parentTips?: string;
  equipment: string[];
  diagramType: 'three_cones_step_left' | 'straight_pace_change' | 'wall_passing' | 'shooting_power' | 'first_touch_shooting' | 'man_on_two_cone' | 'two_choice_xavi' | 'aerial_toss' | 'press_channel';
}

export interface TrainingDay {
  id: string;
  dayNumber: number;
  title: string;
  theme: string;
  summary: string;
  estimatedMinutes: number;
  color: string;
  drills: Drill[];
}

export interface WorkoutRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayId: string; // 'day-1', 'day-2', etc. or 'team-practice' or 'rest'
  dayTitle: string;
  completedDrillIds: string[];
  totalDrills: number;
  durationMinutes: number;
  rating?: number; // 1 to 5 stars
  notes?: string;
  completedAt: string;
  xpEarned: number;
}

export interface MatchStats {
  goals: number;
  assists: number;
  tackles: number;
  successfulDribbles: number;
  passesCompleted: number;
  crosses: number;
  cleanSheet: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'drills' | 'streak' | 'skills' | 'milestones' | 'season' | 'match' | 'rewards';
  tier?: 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary';
  realWorldReward?: string;
  xpReward: number;
  unlockedAt?: string;
  progressText?: string;
}

export interface PlayerProfile {
  name: string;
  jerseyNumber: number;
  position: string;
  favoriteTeam: string;
  favoriteColor: string;
  avatarIcon: string;
  level: number;
  currentXp: number;
}

export const DRILL_DIAGRAM_LABELS: Record<string, string> = {
  three_cones_step_left: '3-Cone Deception Setup',
  straight_pace_change: '3-Cone Pace Change Line',
  wall_passing: 'Wall Passing Zone',
  shooting_power: '10-Yard Power Strike',
  first_touch_shooting: 'Central Danger Cone Setup',
  man_on_two_cone: 'Angled Check & Return',
  two_choice_xavi: 'Xavi/Iniesta 2-Goal Decision',
  aerial_toss: 'Aerial Cushion Zone',
  press_channel: '15-Yard Pressing Channel',
};

export const TRAINING_PROGRAM: TrainingDay[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    title: 'Day 1: Beating a Defender & Accelerating',
    theme: 'Deception & Pace Change',
    summary: 'Master fake moves, dropping the shoulder, and explosive pace change into open space.',
    estimatedMinutes: 15,
    color: 'emerald',
    drills: [
      {
        id: 'day1-drill1',
        title: 'Step Right and Go Left',
        focus: 'Deception, first touch past the defender, acceleration.',
        videoUrl: 'https://www.youtube.com/watch?v=wqOvW02ZU68',
        youtubeId: 'wqOvW02ZU68',
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Set up 3 cones in a triangle/line: starting cone, imaginary defender cone (5 yards out), and exit cone (5-7 yards diagonally left).',
        actionDescription: 'Approach defender cone with speed, step right and drop right shoulder to fake going right. Instantly push the ball diagonally forward with outside of left foot, and accelerate to the exit cone!',
        dose: '4–5 repetitions in each direction, rest 60s, then repeat once (approx 10 reps total).',
        repsTarget: 10,
        durationMinutes: 8,
        coachingCue: 'Drop your shoulder low on the fake, then EXPLODE with your outside touch!',
        parentTips: 'Encourage an exaggerated shoulder dip to really fool the defender cone.',
        equipment: ['3 Cones', '1 Soccer Ball'],
        diagramType: 'three_cones_step_left',
      },
      {
        id: 'day1-drill2',
        title: 'Slow Dribble → Big Touch → Accelerate',
        focus: 'Changing pace and taking a larger touch into space before accelerating.',
        videoUrl: 'https://www.youtube.com/watch?v=bIjJr9lNcXg',
        youtubeId: 'bIjJr9lNcXg',
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Place 3 cones in a straight line: start cone, second cone 5 yards ahead, finish cone 15 yards beyond second cone.',
        actionDescription: '1. Dribble slowly toward the second cone.\n2. At the second cone, take a bigger touch forward into open grass.\n3. Accelerate immediately at 100% speed with ball under control until passing the finish cone.\n4. Walk back to recover.',
        dose: '4 repetitions, rest 60s, then another 4 repetitions. Alternate left and right foot touches.',
        repsTarget: 8,
        durationMinutes: 8,
        coachingCue: 'Shift from 1st gear (slow) right into 5th gear (TURBO)!',
        parentTips: 'Make sure the acceleration touch is far enough ahead to sprint into, but still controllable.',
        equipment: ['3 Cones', '1 Soccer Ball', '20-yard Space'],
        diagramType: 'straight_pace_change',
      },
    ],
  },
  {
    id: 'day-2',
    dayNumber: 2,
    title: 'Day 2: Passing & Shooting',
    theme: 'Clean Contact & Strike Power',
    summary: 'Build crisp wall passing with both feet, power shooting laces strikes, and sharp first touch setups.',
    estimatedMinutes: 20,
    color: 'amber',
    drills: [
      {
        id: 'day2-drill1',
        title: 'Short Passing Against a Wall',
        focus: 'Clean contact, passing with both feet, ground consistency.',
        videoUrl: 'https://www.youtube.com/watch?v=25coBn2xJws',
        youtubeId: '25coBn2xJws',
        sourceLabel: '3 Small-Space Wall Drills',
        setupDescription: 'Stand 2-3 yards away from a sturdy brick, concrete, or rebound wall with your soccer ball.',
        actionDescription: 'Work through passing progressions: short one-touch passes, alternating right and left foot, and two-touch control-pass variation. Keep passes firm, crisp, and flat along the turf.',
        dose: '5 minutes continuous passing. Prioritize clean contact with weaker foot over kicking hard.',
        repsTarget: 20,
        durationMinutes: 5,
        coachingCue: 'Firm locked ankle, toes slightly up, strike right through the equator of the ball.',
        parentTips: 'Count their consecutive smooth wall passes out loud to turn it into a fun challenge!',
        equipment: ['Sturdy Wall or Rebounder', '1 Soccer Ball'],
        diagramType: 'wall_passing',
      },
      {
        id: 'day2-drill2',
        title: 'Shooting for Power',
        focus: 'Striking technique, ball speed, and firm ankle follow-through.',
        videoUrl: 'https://www.youtube.com/watch?v=BrzfmkGtnYE',
        youtubeId: 'BrzfmkGtnYE',
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Place a stationary ball approximately 10 yards out from the goal or shooting target.',
        actionDescription: 'Practice the laces strike: plant foot pointed at goal next to the ball, head over ball, ankle locked downwards, striking with shoelaces and landing on your shooting foot.',
        dose: '6–8 shots with short recovery between attempts. Stop if technique deteriorates.',
        repsTarget: 8,
        durationMinutes: 7,
        coachingCue: 'Plant foot beside ball, laces down, strike through the ball like a rocket!',
        parentTips: 'Remind him to keep his chest slightly over the ball so shots do not sail over the crossbar.',
        equipment: ['Goal or Wall Target', '1-3 Soccer Balls', '1 Cone (Marking 10 yds)'],
        diagramType: 'shooting_power',
      },
      {
        id: 'day2-drill3',
        title: 'First Touch Before Shooting',
        focus: 'Setting up a shot around pressure with a diagonal first touch.',
        videoUrl: 'https://www.youtube.com/watch?v=K5gYvmWmDfM',
        youtubeId: 'K5gYvmWmDfM',
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Set up 3 cones in a small triangle/box creating a central area the player must avoid with his first touch, 12 yards from goal.',
        actionDescription: 'Pass or roll ball in, take a positive diagonal first touch out of feet away from the central cone area, then shoot at goal on the second touch.',
        dose: '5–6 attempts with each foot (10-12 total), starting with the stronger foot.',
        repsTarget: 10,
        durationMinutes: 8,
        coachingCue: 'First touch creates the shot! Push it into the scoring lane and strike!',
        parentTips: 'Roll the ball in at realistic speed. Celebrate every clean strike.',
        equipment: ['Goal or Target', '3 Cones', '1-2 Soccer Balls'],
        diagramType: 'first_touch_shooting',
      },
    ],
  },
  {
    id: 'day-3',
    dayNumber: 3,
    title: 'Day 3: Decision-Making Before Receiving',
    theme: 'Scanning & Game Vision',
    summary: 'Train the legendary Xavi & Iniesta habit: shoulder check, scan before the ball arrives, and make instant smart choices.',
    estimatedMinutes: 18,
    color: 'blue',
    drills: [
      {
        id: 'day3-drill1',
        title: 'Man On — Check and Return',
        focus: 'Scanning shoulder and preparing next action before ball contact.',
        videoUrl: 'https://www.youtube.com/watch?v=NwR8x1yOA3M',
        youtubeId: 'NwR8x1yOA3M',
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Set up 2 cones: passer (parent) and receiver (player) 10 yards apart at an angle.',
        actionDescription: 'As the ball travels from the passer, the receiver checks his shoulder to scan for an imaginary defender, sets body shape, and returns a firm 1-touch or 2-touch pass back.',
        dose: '5–7 passes, switch angle to work other foot, repeat twice (around 12-14 passes total).',
        repsTarget: 12,
        durationMinutes: 6,
        coachingCue: 'Check your shoulder while the ball is traveling, not after it arrives!',
        parentTips: 'Call out or hold up fingers behind him so he is forced to actually look over his shoulder.',
        equipment: ['2 Cones', '1 Soccer Ball', 'Parent/Partner'],
        diagramType: 'man_on_two_cone',
      },
      {
        id: 'day3-drill2',
        title: 'Turn or Man On — Two-Choice Drill',
        focus: 'Scanning and choosing action before ball arrives (Xavi & Iniesta skill).',
        videoUrl: 'https://www.youtube.com/watch?v=OzpLy_8eY50',
        youtubeId: 'OzpLy_8eY50',
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Passer at base cone. Receiver 8-10 yards ahead. Set up 2 mini cone goals behind/diagonal to the receiver.',
        actionDescription: 'Parent passes ball and calls either "Man On" or "Turn!".\n• On "Man On": Player scans and immediately plays pass back to parent.\n• On "Turn": Player scans, opens hips, takes forward touch, and passes through one of the cone goals.',
        dose: 'Four 2-minute rounds with short rests between rounds. Keep passes manageable.',
        repsTarget: 4,
        durationMinutes: 10,
        coachingCue: 'Listen, scan, decide! Think before your feet touch the leather!',
        parentTips: 'Call the command just as you strike the ball so he has time to scan and execute.',
        equipment: ['4-6 Cones', '1-2 Soccer Balls', 'Parent/Partner'],
        diagramType: 'two_choice_xavi',
      },
    ],
  },
  {
    id: 'day-4',
    dayNumber: 4,
    title: 'Day 4: Aerial Control & Pressing Discipline',
    theme: 'Soft Touch & 1v1 Defending',
    summary: 'Cushion aerial passes with foot, thigh, and chest; practice patient pressing without lunging in.',
    estimatedMinutes: 18,
    color: 'violet',
    drills: [
      {
        id: 'day4-drill1',
        title: 'Aerial Control (Foot, Thigh, Chest)',
        focus: 'Cushioning aerial ball out of the air and playing back cleanly.',
        videoUrl: 'https://www.youtube.com/watch?v=Ef8ljk1xm7g',
        youtubeId: 'Ef8ljk1xm7g',
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Player and parent stand 4–5 yards apart facing each other.',
        actionDescription: 'Parent gently underhand tosses ball at player\'s foot, thigh, or chest height. Player cushions the ball gently so it lands under control right at his feet, then passes it back on the ground.',
        dose: '5 attempts with each surface (5 foot, 5 thigh, 5 chest), then repeat the weakest one.',
        repsTarget: 15,
        durationMinutes: 8,
        coachingCue: 'Catch the ball like an egg on a pillow! Soft touch, don\'t kick it away.',
        parentTips: 'Toss balls underhand and gently right into their zone. The goal is control confidence, not chasing bad throws.',
        equipment: ['1 Soccer Ball', 'Parent/Partner'],
        diagramType: 'aerial_toss',
      },
      {
        id: 'day4-drill2',
        title: 'Press Without Diving In',
        focus: 'Patient 1v1 defending: sprint to close down, slow down to control.',
        videoUrl: 'https://www.youtube.com/watch?v=bIjJr9lNcXg', // Fallback or OSA defending
        sourceLabel: 'Online Soccer Academy',
        setupDescription: 'Mark a defending channel approximately 10 yards wide and 15 yards long with cones. Parent starts with ball at one end.',
        actionDescription: 'Player sprints forward quickly while parent takes touches, then shortens steps and slows down 2 yards away. Stay low, stay balanced on balls of feet, move side-to-side, and shepherd parent toward sideline without stabbing or lunging.',
        dose: '5 approaches, rest 45s, then 5 more (10 total approaches).',
        repsTarget: 10,
        durationMinutes: 8,
        coachingCue: '“Sprint to close the space; slow down to control the attacker!”',
        parentTips: 'Dribble at moderate speed and test if he lunges. Praise him whenever he stays patient and forces you wide.',
        equipment: ['4 Cones', '1 Soccer Ball', 'Parent/Partner'],
        diagramType: 'press_channel',
      },
    ],
  },
];

export const INITIAL_BADGES: Badge[] = [
  // --- DRILL & SKILL MASTERIES (BRAWL STARS / EA FC PLAYSTYLES) ---
  {
    id: 'badge-first-step',
    title: 'First Kickoff',
    description: 'Completed your very first soccer homework session! Welcome to the club.',
    icon: '⚽',
    category: 'milestones',
    tier: 'bronze',
    xpReward: 100,
  },
  {
    id: 'badge-step-master',
    title: 'Ankle Breaker',
    description: 'Mastered the Step Right & Go Left deception move against the defender.',
    icon: '⚡',
    category: 'skills',
    tier: 'bronze',
    xpReward: 150,
  },
  {
    id: 'badge-turbo-pace',
    title: 'Turbo Charged',
    description: 'Exploded into 5th gear on the pace-change big touch acceleration drill.',
    icon: '🏎️',
    category: 'skills',
    tier: 'bronze',
    xpReward: 150,
  },
  {
    id: 'badge-wall-wizard',
    title: 'Wall Wizard (Bronze)',
    description: 'Completed clean wall passes with both left and right feet.',
    icon: '🧱',
    category: 'skills',
    tier: 'bronze',
    xpReward: 150,
  },
  {
    id: 'badge-wall-wizard-silver',
    title: 'Wall Virtuoso (Silver)',
    description: 'Logged 5 wall passing sessions! Rebound technique is becoming second nature.',
    icon: '🥈',
    category: 'skills',
    tier: 'silver',
    xpReward: 250,
  },
  {
    id: 'badge-wall-wizard-gold',
    title: 'Wall Grandmaster (Gold)',
    description: 'Logged 15 wall passing sessions! Pristine two-touch and one-touch rebound mastery.',
    icon: '🥇',
    category: 'skills',
    tier: 'gold',
    xpReward: 400,
  },
  {
    id: 'badge-rocket-boots',
    title: 'Rocket Launcher (Bronze)',
    description: 'Drilled 8 laces strikes with locked ankles from 10 yards out.',
    icon: '🚀',
    category: 'skills',
    tier: 'bronze',
    xpReward: 150,
  },
  {
    id: 'badge-rocket-boots-silver',
    title: 'Cannon Foot (Silver)',
    description: 'Logged 5 shooting power sessions. Consistent laces dip and sting on the ball.',
    icon: '💥',
    category: 'skills',
    tier: 'silver',
    xpReward: 250,
  },
  {
    id: 'badge-rocket-boots-gold',
    title: 'Sniper Supreme (Gold)',
    description: 'Logged 15 shooting sessions! Elite precision and power strike technique.',
    icon: '🎯',
    category: 'skills',
    tier: 'gold',
    xpReward: 400,
  },
  {
    id: 'badge-xavi-vision',
    title: 'Midfield Maestro',
    description: 'Scanned shoulders like Xavi and made instant "Man On" or "Turn" decisions.',
    icon: '🧠',
    category: 'skills',
    tier: 'bronze',
    xpReward: 150,
  },
  {
    id: 'badge-pillow-touch',
    title: 'Velvet Touch',
    description: 'Cushioned aerial balls on foot, thigh, and chest right to the grass.',
    icon: '🪶',
    category: 'skills',
    tier: 'bronze',
    xpReward: 150,
  },
  {
    id: 'badge-brick-wall',
    title: 'The Great Wall',
    description: 'Practiced patient pressing discipline without diving in or lunging.',
    icon: '🛡️',
    category: 'skills',
    tier: 'bronze',
    xpReward: 150,
  },

  // --- MATCH DAY FEATS (WEEKEND GAME ACCOMPLISHMENTS) ---
  {
    id: 'badge-first-goal',
    title: 'First Match Goal',
    description: 'Found the back of the net in a competitive match! The first of many.',
    icon: '⚽',
    category: 'match',
    tier: 'bronze',
    xpReward: 200,
  },
  {
    id: 'badge-match-brace',
    title: 'Match Brace (2 Goals)',
    description: 'Scored two goals in a single weekend match! Double trouble for defenders.',
    icon: '🔥',
    category: 'match',
    tier: 'silver',
    xpReward: 300,
  },
  {
    id: 'badge-match-hat-trick',
    title: 'Match Hat-Trick (3 Goals)',
    description: 'Scored 3 or more goals in one match! An unforgettable performance.',
    icon: '🎩',
    category: 'match',
    tier: 'gold',
    xpReward: 500,
  },
  {
    id: 'badge-playmaker-assist',
    title: 'Playmaker Assist',
    description: 'Delivered a pinpoint pass leading directly to a teammate\'s match goal.',
    icon: '👟',
    category: 'match',
    tier: 'bronze',
    xpReward: 200,
  },
  {
    id: 'badge-take-on-master',
    title: '1v1 Take-On King',
    description: 'Completed 3+ successful dribbles past defenders in a match!',
    icon: '🌪️',
    category: 'match',
    tier: 'silver',
    xpReward: 250,
  },
  {
    id: 'badge-metronome-passer',
    title: 'Metronome Passer',
    description: 'Completed 10+ accurate passes to teammates during competitive match play.',
    icon: '📐',
    category: 'match',
    tier: 'silver',
    xpReward: 250,
  },
  {
    id: 'badge-defensive-anchor',
    title: 'Defensive Anchor',
    description: 'Made 3+ clean tackles and won defensive duels in a game!',
    icon: '🛑',
    category: 'match',
    tier: 'bronze',
    xpReward: 200,
  },
  {
    id: 'badge-pinpoint-crosser',
    title: 'Pinpoint Crosser',
    description: 'Whipped in 2+ dangerous crosses into the box from wide areas.',
    icon: '🏹',
    category: 'match',
    tier: 'bronze',
    xpReward: 200,
  },
  {
    id: 'badge-clean-sheet',
    title: 'Clean Sheet Shield',
    description: 'Kept a clean sheet on defense or in goal — zero goals conceded!',
    icon: '🧤',
    category: 'match',
    tier: 'silver',
    xpReward: 300,
  },
  {
    id: 'badge-match-mvp',
    title: 'Match MVP Influence',
    description: 'Total of 3+ goal contributions (goals + assists) in a single game!',
    icon: '🌟',
    category: 'match',
    tier: 'gold',
    xpReward: 400,
  },

  // --- SEASON MILESTONES (3-4 MONTH TROPHY ROAD) ---
  {
    id: 'badge-week-1',
    title: 'Week 1 Kickoff',
    description: 'Completed all 3 recommended homework sessions in your first training week.',
    icon: '🥉',
    category: 'season',
    tier: 'bronze',
    xpReward: 200,
  },
  {
    id: 'badge-month-1',
    title: 'Month 1 Veteran',
    description: 'Logged 12 completed homework sessions! First month of solid habit built.',
    icon: '🏅',
    category: 'season',
    tier: 'silver',
    xpReward: 400,
  },
  {
    id: 'badge-mid-season',
    title: 'Mid-Season Dynamo',
    description: 'Logged 24 completed sessions! Halfway through the 3-4 month season roadmap.',
    icon: '🎖️',
    category: 'season',
    tier: 'gold',
    xpReward: 600,
  },
  {
    id: 'badge-season-legend-36',
    title: 'Season Legend (36 Sessions)',
    description: 'Completed 36 sessions — the official 3-month season standard of excellence!',
    icon: '👑',
    category: 'season',
    tier: 'diamond',
    xpReward: 800,
  },
  {
    id: 'badge-season-centurion-48',
    title: 'Season Centurion (48 Sessions)',
    description: 'Completed 48 sessions — absolute master of the full 4-month season!',
    icon: '🏆',
    category: 'season',
    tier: 'legendary',
    xpReward: 1200,
  },
  {
    id: 'badge-team-captain',
    title: 'Future Captain',
    description: 'Logged 10 total training activities including homework and team practices.',
    icon: '⭐',
    category: 'milestones',
    tier: 'bronze',
    xpReward: 250,
  },
  {
    id: 'badge-half-century',
    title: 'Half-Century Club (50 Activities)',
    description: 'Logged 50 total soccer activities across homework, practices, and games.',
    icon: '🌟',
    category: 'season',
    tier: 'gold',
    xpReward: 500,
  },
  {
    id: 'badge-century-club',
    title: 'Century Club (100 Activities)',
    description: 'Logged 100 total soccer activities across the whole season! Truly elite.',
    icon: '💯',
    category: 'season',
    tier: 'legendary',
    xpReward: 1500,
  },

  // --- STREAKS & HABIT FIRE ---
  {
    id: 'badge-streak-fire',
    title: '3-Day Spark',
    description: 'Maintained an active soccer training streak of 3 consecutive days.',
    icon: '🔥',
    category: 'streak',
    tier: 'bronze',
    xpReward: 200,
  },
  {
    id: 'badge-streak-7',
    title: '7-Day Inferno',
    description: '1 full week uninterrupted streak! Dedication worthy of a pro academy player.',
    icon: '⚡',
    category: 'streak',
    tier: 'silver',
    xpReward: 350,
  },
  {
    id: 'badge-streak-14',
    title: '14-Day Iron Will',
    description: '2 straight weeks of active soccer training without missing a single day.',
    icon: '💎',
    category: 'streak',
    tier: 'gold',
    xpReward: 600,
  },
  {
    id: 'badge-streak-30',
    title: '30-Day Legend Streak',
    description: '30 days in a row! Unbelievable discipline and passion for the game.',
    icon: '👑',
    category: 'streak',
    tier: 'legendary',
    xpReward: 1000,
  },

  // --- REAL-WORLD PARENT REWARD CONTRACTS (BRAWL PASS / SEASON REWARDS) ---
  {
    id: 'reward-movie-night',
    title: 'Friday Movie & Popcorn Boss',
    description: 'Unlocked at 5 Workouts! Parent Voucher: You pick the Friday family movie & snacks.',
    icon: '🍿',
    category: 'rewards',
    tier: 'bronze',
    realWorldReward: 'Choose Friday family movie & snack bar of choice!',
    xpReward: 200,
  },
  {
    id: 'reward-ice-cream',
    title: 'Post-Match Treat Run',
    description: 'Unlocked at 10 Workouts! Parent Voucher: Ice cream parlor or favorite smoothie trip.',
    icon: '🍦',
    category: 'rewards',
    tier: 'silver',
    realWorldReward: 'Post-match ice cream or smoothie trip of your choice!',
    xpReward: 300,
  },
  {
    id: 'reward-grip-socks',
    title: 'Pro Grip Socks Upgrade',
    description: 'Unlocked at 18 Workouts! Parent Voucher: New pair of pro soccer grip socks or shinguards.',
    icon: '🧦',
    category: 'rewards',
    tier: 'gold',
    realWorldReward: 'New pair of soccer grip socks or training shinguards!',
    xpReward: 500,
  },
  {
    id: 'reward-matchday-feast',
    title: 'Matchday Feast Leader',
    description: 'Unlocked at 28 Workouts! Parent Voucher: You choose the family dinner spot after a match.',
    icon: '🍕',
    category: 'rewards',
    tier: 'gold',
    realWorldReward: 'Choose family matchday dinner (Pizza, Burgers, or favorite spot)!',
    xpReward: 700,
  },
  {
    id: 'reward-championship-ball',
    title: 'Season Grand Champion Prize',
    description: 'Unlocked at 40 Workouts! Parent Voucher: Official match ball or favorite player jersey!',
    icon: '🎁',
    category: 'rewards',
    tier: 'legendary',
    realWorldReward: 'Official soccer match ball or authentic player jersey of choice!',
    xpReward: 1200,
  },
];

