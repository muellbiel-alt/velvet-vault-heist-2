// A guard walks a fixed patrol loop, pauses at each stop to look around, and turns toward
// whatever he is watching. A coin on the floor pulls him off his route to investigate; a
// rising alarm sends him toward the thief. He never teleports and never sees through walls.
import { GUARD } from '../core/config.js';

export function createGuard(waypoints, phase) {
  return {
    waypoints,
    index: 0,
    x: waypoints[0].x,
    y: waypoints[0].y,
    angle: 0,
    radius: GUARD.radius,
    pause: phase,
    investigate: null,
    chase: false,
  };
}

function angleToward(from, to, current, maxTurn) {
  let diff = to - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) <= maxTurn) return to;
  return current + Math.sign(diff) * maxTurn;
}

function moveToward(guard, tx, ty, speed, step) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const go = Math.min(dist, speed * step);
  guard.x += (dx / dist) * go;
  guard.y += (dy / dist) * go;
  guard.angle = angleToward(guard.angle, Math.atan2(dy, dx), guard.angle, GUARD.turnRate * step);
  return dist - go < 1;
}

export function updateGuard(guard, step, chaseTarget) {
  // A coin investigation beats the patrol; a chase beats both.
  if (chaseTarget) {
    guard.chase = true;
    moveToward(guard, chaseTarget.x, chaseTarget.y, GUARD.chaseSpeed, step);
    return;
  }
  guard.chase = false;
  if (guard.investigate) {
    const arrived = moveToward(guard, guard.investigate.x, guard.investigate.y, GUARD.patrolSpeed * 1.5, step);
    if (arrived) {
      guard.investigate.timer -= step;
      guard.angle += Math.sin(guard.investigate.timer * 2.4) * 0.03;
      if (guard.investigate.timer <= 0) guard.investigate = null;
    }
    return;
  }
  const target = guard.waypoints[guard.index];
  if (guard.pause > 0) {
    guard.pause -= step;
    guard.angle += Math.sin(guard.pause * 1.8) * 0.015;
    if (guard.pause <= 0) guard.index = (guard.index + 1) % guard.waypoints.length;
    return;
  }
  const arrived = moveToward(guard, target.x, target.y, GUARD.patrolSpeed, step);
  if (arrived) guard.pause = GUARD.pauseAtWaypoint;
}
