// Screenshot scenes behind ?shot=start|play|alert|end. Each one plays the real rules forward
// from a fresh world with a scripted route, so the frame is what a short game really looks
// like and the same seed always gives the same frame. The autopilot waits when the next
// stretch is under a cone, the way a careful player would.
import { CAMERA, GUARD, STEP } from './core/config.js';
import { createWorld, resetWorld, stepWorld } from './world/state.js';
import { detectorSees } from './systems/vision.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './ui/render.js';

const SAMPLE = STEP;

/** Is any point on the segment from (x1, y1) to (x2, y2) under a cone right now? */
function segmentSeen(state, x1, y1, x2, y2) {
  for (let t = 0; t <= 1; t += 0.125) {
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    const probe = { x: px, y: py };
    for (const guard of state.guards) {
      if (detectorSees(state.room, guard, GUARD.visionRange, GUARD.halfAngle, probe)) return true;
    }
    for (const camera of state.cameras) {
      if (camera.disabled > 0) continue;
      if (detectorSees(state.room, camera, CAMERA.visionRange, CAMERA.halfAngle, probe)) return true;
    }
  }
  return false;
}

/** Drive toward a point for one step; wait in place while the way ahead is watched. */
function drive(state, target, step, audio, waitBudget) {
  const dx = target.x - state.thief.x;
  const dy = target.y - state.thief.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 10) return { arrived: true, waitBudget };
  if (segmentSeen(state, state.thief.x, state.thief.y, target.x, target.y)) {
    if (waitBudget > 0) {
      stepWorld(state, { x: 0, y: 0 }, true, step, null, false, audio);
      return { arrived: false, waitBudget: waitBudget - step };
    }
  }
  stepWorld(state, { x: dx / dist, y: dy / dist }, false, step, null, false, audio);
  return { arrived: false, waitBudget };
}

/** Follow a route of waypoints, waiting out cones on the way, up to `maxSeconds`. */
function followRoute(state, waypoints, maxSeconds, audio) {
  let waitBudget = 8;
  let elapsed = 0;
  for (const point of waypoints) {
    let arrived = false;
    while (!arrived && elapsed < maxSeconds && state.status === 'playing') {
      const result = drive(state, point, SAMPLE, audio, waitBudget);
      arrived = result.arrived;
      waitBudget = result.waitBudget;
      elapsed += SAMPLE;
    }
    waitBudget = 8;
  }
  return elapsed;
}

export function stageShot(name, state, audio) {
  resetWorld(state);
  if (name === 'play') {
    // Mid-heist: the thief slips behind the left display case while a camera cone sweeps.
    followRoute(state, [
      { x: 160, y: 520 },
      { x: 270, y: 520 },
      { x: 270, y: 420 },
    ], 20, audio);
    for (let i = 0; i < 2 / SAMPLE; i += 1) stepWorld(state, { x: 0, y: 0 }, true, SAMPLE, null, false, audio);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'alert') {
    // The alarm climbs: the thief waits on the top guard's patrol line until spotted.
    followRoute(state, [
      { x: 160, y: 420 },
      { x: 430, y: 420 },
      { x: 490, y: 280 },
      { x: 640, y: 210 },
    ], 30, audio);
    let guard = 0;
    while (state.alarm.value < 55 && guard < 20 && state.status === 'playing') {
      stepWorld(state, { x: 0, y: 0 }, false, SAMPLE, null, false, audio);
      guard += SAMPLE;
    }
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'end') {
    // The full job: gold on the left, the diamond at the top, out the green door.
    followRoute(state, [
      { x: 160, y: 420 },
      { x: 160, y: 180 },
      { x: 240, y: 238 },
      { x: 560, y: 120 },
      { x: 640, y: 142 },
      { x: 1120, y: 110 },
      { x: 1120, y: 640 },
    ], 75, audio);
    if (state.status === 'won') return { screen: SCREEN_WON, best: state.score };
    return { screen: SCREEN_PLAY, best: 0 };
  }
  // start: the title over a live room, four seconds in.
  for (let i = 0; i < 4 / SAMPLE; i += 1) stepWorld(state, { x: 0, y: 0 }, false, SAMPLE, null, false, audio);
  return { screen: SCREEN_TITLE, best: 0 };
}
