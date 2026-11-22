// Velvet Vault — shared constants: one room, one frame, everything readable at a glance.
// Palette: deep velvet red and brass gold on a dark blue night floor. No violet, no neon.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const STEP = 1 / 60;

export const PALETTE = {
  floorA: '#20263a',
  floorB: '#1c2334',
  floorLine: '#2a3350',
  carpet: '#7c1522',
  carpetEdge: '#c9a227',
  wall: '#0e1322',
  wallTrim: '#c9a227',
  wood: '#4a3220',
  woodTop: '#5d3f28',
  glass: '#9fb4c8',
  pillar: '#39415c',
  statue: '#c9a227',
  rope: '#a31626',
  ropePost: '#d8b45a',
  guardUniform: '#2b3a5c',
  guardSkin: '#d9a066',
  guardCap: '#1a2440',
  coneCalm: 'rgba(255, 207, 92, 0.16)',
  coneCalmEdge: 'rgba(255, 207, 92, 0.45)',
  coneHot: 'rgba(255, 77, 61, 0.30)',
  coneHotEdge: 'rgba(255, 77, 61, 0.7)',
  coneCam: 'rgba(255, 233, 168, 0.12)',
  thiefCoat: '#1c1c22',
  thiefScarf: '#b3122e',
  thiefTrim: '#e8c766',
  gold: '#ffd94a',
  goldDark: '#e8b93a',
  exitGreen: '#2fae6e',
  alarmGreen: '#37c978',
  alarmAmber: '#ffb02e',
  alarmRed: '#ff4d3d',
  ink: '#f2ead8',
  inkDim: '#b9b3a4',
  shadow: 'rgba(6, 8, 16, 0.55)',
};

// The thief: quick on feet, quiet when sneaking. Sneaking halves how fast you are noticed.
export const THIEF = {
  radius: 13,
  walkSpeed: 178,
  sneakSpeed: 96,
  coins: 3,
  smokes: 2,
  coinRange: 430,
  smokeRadius: 320,
};

// Guards read the room with a cone; cameras sweep theirs. All angles in radians.
export const GUARD = {
  radius: 14,
  patrolSpeed: 55,
  chaseSpeed: 102,
  visionRange: 232,
  halfAngle: 0.56,
  pauseAtWaypoint: 1.2,
  turnRate: 3.4,
};

export const CAMERA = {
  visionRange: 262,
  halfAngle: 0.46,
  sweepSeconds: 6.0,
  disabledSeconds: 8,
};

// Alarm: 0..100. Seen, it climbs; hidden, it falls. At 100 the heist is over.
export const ALARM = {
  risePerSecond: 30,
  riseSneaking: 15,
  fallPerSecond: 8,
  chaseAbove: 70,
  warnAbove: 45,
};

export const SCORE = {
  diamond: 1000,
  goldBar: 150,
  timeBonusPerSecond: 10,
  timeBonusWindow: 180,
  stealthBonusPerPoint: 2,
};
