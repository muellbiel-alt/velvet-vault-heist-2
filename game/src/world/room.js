// The vault hall: one big room the thief crosses from the entry door (bottom left) to the
// getaway door (bottom right), past the Velvet Diamond on its pedestal at the top.
// Tall furniture blocks movement AND sight; low pedestals block movement only.
import { VIEW_H, VIEW_W } from '../core/config.js';

export const WALL = 28;

// Rects are {x, y, w, h} in room coordinates.
export function createRoom() {
  const tall = [
    // Display cases: long glass cases you must walk around, and hide behind.
    { x: 180, y: 300, w: 220, h: 70, kind: 'case' },
    { x: 880, y: 300, w: 220, h: 70, kind: 'case' },
    { x: 180, y: 130, w: 160, h: 60, kind: 'case' },
    { x: 940, y: 130, w: 160, h: 60, kind: 'case' },
    // Pillars hold the ceiling up and break every sightline.
    { x: 420, y: 250, w: 44, h: 44, kind: 'pillar' },
    { x: 816, y: 250, w: 44, h: 44, kind: 'pillar' },
    { x: 420, y: 470, w: 44, h: 44, kind: 'pillar' },
    { x: 816, y: 470, w: 44, h: 44, kind: 'pillar' },
    // The golden statue in the middle of the hall.
    { x: 616, y: 400, w: 48, h: 48, kind: 'statue' },
  ];
  const low = [
    // Gold-bar pedestals: low enough to see over, solid enough to walk around.
    { x: 222, y: 182, w: 36, h: 36, kind: 'pedestal' },
    { x: 1022, y: 182, w: 36, h: 36, kind: 'pedestal' },
    // The diamond's own pedestal.
    { x: 616, y: 76, w: 48, h: 48, kind: 'vault' },
  ];
  // Velvet ropes run along the carpet's edges: decoration only, they never block a step.
  const ropes = [
    { x1: 560, y1: 150, x2: 560, y2: 660 },
    { x1: 720, y1: 150, x2: 720, y2: 660 },
  ];
  return {
    tall,
    low,
    ropes,
    entry: { x: 160, y: 640 },
    exit: { x: 1120, y: 640 },
    diamond: { x: 640, y: 100 },
    goldBars: [
      { x: 240, y: 200, taken: false },
      { x: 1040, y: 200, taken: false },
    ],
    bounds: { x: WALL, y: WALL, w: VIEW_W - WALL * 2, h: VIEW_H - WALL * 2 },
  };
}

function circleHitsRect(x, y, radius, rect) {
  const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

// True when a circle at (x, y) would touch a wall, a tall piece or a low pedestal.
export function blockedAt(room, x, y, radius) {
  const b = room.bounds;
  if (x - radius < b.x || x + radius > b.x + b.w || y - radius < b.y || y + radius > b.y + b.h) return true;
  for (const rect of room.tall) if (circleHitsRect(x, y, radius, rect)) return true;
  for (const rect of room.low) if (circleHitsRect(x, y, radius, rect)) return true;
  return false;
}

// Move a circle one axis at a time so it slides along furniture instead of sticking.
export function moveCircle(room, x, y, radius, dx, dy) {
  let nx = x + dx;
  if (blockedAt(room, nx, y, radius)) nx = x;
  let ny = y + dy;
  if (blockedAt(room, nx, ny, radius)) ny = y;
  return { x: nx, y: ny };
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Slab test: walk the segment against the rect's four sides.
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  const slabs = [
    [dx, x1 - rect.x],
    [-dx, rect.x + rect.w - x1],
    [dy, y1 - rect.y],
    [-dy, rect.y + rect.h - y1],
  ];
  for (const [d, offset] of slabs) {
    if (d === 0) {
      if (offset < 0) return false;
    } else {
      const t = offset / d;
      if (d < 0) {
        if (t > tMax) return false;
        if (t > tMin) tMin = t;
      } else {
        if (t < tMin) return false;
        if (t < tMax) tMax = t;
      }
    }
  }
  return true;
}

// True when a straight look from (x1, y1) to (x2, y2) is cut by a wall or tall furniture.
// Low pedestals never block sight.
export function sightBlocked(room, x1, y1, x2, y2) {
  const b = room.bounds;
  const inBounds = (x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  if (!inBounds(x1, y1) || !inBounds(x2, y2)) return true;
  for (const rect of room.tall) if (segmentHitsRect(x1, y1, x2, y2, rect)) return true;
  return false;
}
