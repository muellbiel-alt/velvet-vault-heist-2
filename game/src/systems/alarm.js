// The alarm meter: 0 to 100. It climbs while any guard or camera has eyes on the thief
// (slower while sneaking), and falls again once the thief breaks line of sight. Crossing
// the warning line sounds the alarm once; reaching 100 ends the heist.
import { ALARM } from '../core/config.js';

export function createAlarm() {
  return { value: 0, peak: 0, warned: false };
}

export function updateAlarm(alarm, seen, sneaking, step, audio) {
  if (seen) {
    const rate = sneaking ? ALARM.riseSneaking : ALARM.risePerSecond;
    alarm.value = Math.min(100, alarm.value + rate * step);
    if (alarm.value > ALARM.warnAbove && !alarm.warned) {
      alarm.warned = true;
      if (audio) audio.spotted();
    }
  } else {
    alarm.value = Math.max(0, alarm.value - ALARM.fallPerSecond * step);
    if (alarm.value < ALARM.warnAbove - 10) alarm.warned = false;
  }
  if (alarm.value > alarm.peak) alarm.peak = alarm.value;
  return alarm.value >= 100;
}
