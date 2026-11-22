// The thief: one small figure in a dark coat and a red scarf, crossing the hall on foot.
// Coins distract a guard; smoke switches cameras off for a while. Both are spent, not free.
import { THIEF } from '../core/config.js';
import { moveCircle } from '../world/room.js';

export function createThief(room) {
  return {
    x: room.entry.x,
    y: room.entry.y,
    radius: THIEF.radius,
    face: -Math.PI / 2,
    coins: THIEF.coins,
    smokes: THIEF.smokes,
    hasDiamond: false,
    goldTaken: 0,
    stepCycle: 0,
    moving: false,
    sneaking: false,
  };
}

export function updateThief(thief, room, direction, sneaking, step, audio) {
  thief.sneaking = sneaking;
  const speed = sneaking ? THIEF.sneakSpeed : THIEF.walkSpeed;
  const moving = direction.x !== 0 || direction.y !== 0;
  thief.moving = moving;
  if (moving) {
    thief.face = Math.atan2(direction.y, direction.x);
    const moved = moveCircle(room, thief.x, thief.y, thief.radius, direction.x * speed * step, direction.y * speed * step);
    thief.x = moved.x;
    thief.y = moved.y;
    thief.stepCycle += step * speed;
    if (thief.stepCycle > 34) {
      thief.stepCycle = 0;
      if (audio) audio.step();
    }
  }
}

export function throwCoin(thief, target) {
  if (thief.coins <= 0) return null;
  const dx = target.x - thief.x;
  const dy = target.y - thief.y;
  const dist = Math.hypot(dx, dy);
  if (dist > THIEF.coinRange) return null;
  thief.coins -= 1;
  return { x: target.x, y: target.y, timer: 4, ring: 0 };
}

export function useSmoke(thief) {
  if (thief.smokes <= 0) return false;
  thief.smokes -= 1;
  return true;
}
