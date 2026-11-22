// A wall camera sweeps its cone back and forth on a fixed arc. Smoke switches it off for
// a few seconds; while it is off its cone is gone and its little red eye goes dark.
import { CAMERA } from '../core/config.js';

export function createCamera(x, y, fromAngle, toAngle) {
  return {
    x,
    y,
    fromAngle,
    toAngle,
    angle: fromAngle,
    sweep: 0,
    disabled: 0,
  };
}

export function updateCamera(camera, step) {
  if (camera.disabled > 0) {
    camera.disabled -= step;
    return;
  }
  camera.sweep += step / CAMERA.sweepSeconds;
  const t = (Math.sin(camera.sweep * Math.PI * 2) + 1) / 2;
  camera.angle = camera.fromAngle + (camera.toAngle - camera.fromAngle) * t;
}
