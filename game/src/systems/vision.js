// Vision: a cone is a fan of rays. Each ray walks out until a wall or tall furniture stops
// it, so cones bend around cases and pillars exactly the way a real look would. A detector
// sees the thief only when the thief stands inside its cone AND the straight look is clear.
import { sightBlocked } from '../world/room.js';

const RAY_STEP = 6;
const RAY_COUNT = 26;

// The distance a ray from (x, y) along `angle` travels before it hits something.
export function rayLength(room, x, y, angle, maxRange) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let dist = 0;
  while (dist < maxRange) {
    dist += RAY_STEP;
    const px = x + cos * dist;
    const py = y + sin * dist;
    const b = room.bounds;
    if (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h) return dist;
    for (const rect of room.tall) {
      if (px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h) return dist;
    }
  }
  return maxRange;
}

// The cone's outline as a list of points, for drawing and for the point-in-cone test.
export function conePolygon(room, x, y, angle, range, halfAngle) {
  const points = [{ x, y }];
  for (let i = 0; i <= RAY_COUNT; i += 1) {
    const a = angle - halfAngle + (2 * halfAngle * i) / RAY_COUNT;
    const length = rayLength(room, x, y, a, range);
    points.push({ x: x + Math.cos(a) * length, y: y + Math.sin(a) * length });
  }
  return points;
}

export function pointInCone(px, py, x, y, angle, range, halfAngle) {
  const dx = px - x;
  const dy = py - y;
  const dist = Math.hypot(dx, dy);
  if (dist > range || dist < 1) return dist < 1;
  let diff = Math.atan2(dy, dx) - angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) <= halfAngle;
}

// True when the detector's cone covers the thief and no wall or case stands between them.
export function detectorSees(room, detector, range, halfAngle, thief) {
  if (!pointInCone(thief.x, thief.y, detector.x, detector.y, detector.angle, range, halfAngle)) return false;
  return !sightBlocked(room, detector.x, detector.y, thief.x, thief.y);
}
