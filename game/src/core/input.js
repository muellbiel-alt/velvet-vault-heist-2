// Keyboard and mouse: WASD or arrows to move, Shift to sneak, Q or click to toss a coin,
// E for smoke, P or Escape to pause, M to mute, Space or Enter to confirm.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_COIN = 4;
export const ACTION_SMOKE = 8;
export const ACTION_MUTE = 16;

const MOVE_KEYS = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

export function createInput(canvas) {
  const held = new Set();
  let actions = 0;
  let click = null;
  let mouse = { x: 0, y: 0 };

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    held.add(event.code);
    if (event.code === 'Space' || event.code === 'Enter') actions |= ACTION_CONFIRM;
    if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    if (event.code === 'KeyQ') actions |= ACTION_COIN;
    if (event.code === 'KeyE') actions |= ACTION_SMOKE;
    if (event.code === 'KeyM') actions |= ACTION_MUTE;
    if (MOVE_KEYS[event.code] || event.code === 'Space') event.preventDefault();
  });
  window.addEventListener('keyup', (event) => held.delete(event.code));
  window.addEventListener('blur', () => held.clear());
  canvas.addEventListener('mousemove', (event) => {
    mouse = canvasPoint(event);
  });
  canvas.addEventListener('mousedown', (event) => {
    const point = canvasPoint(event);
    mouse = point;
    click = point;
    if (event.button === 0) actions |= ACTION_COIN;
  });

  return {
    direction() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        const move = MOVE_KEYS[code];
        if (move) {
          x += move[0];
          y += move[1];
        }
      }
      if (x === 0 && y === 0) return { x: 0, y: 0 };
      const length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    },
    sneaking() {
      return held.has('ShiftLeft') || held.has('ShiftRight');
    },
    mouse() {
      return mouse;
    },
    takeClick() {
      const point = click;
      click = null;
      return point;
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
