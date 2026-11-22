// Screen overlays: title, pause, caught and the getaway. Short lines, one idea each —
// the room stays visible behind them, so the cover is the game itself, not a wall of text.
// The title keeps to four lines in the upper third; the hall, its guards and its cones
// stay in full view below it.
import { PALETTE, VIEW_H, VIEW_W } from '../core/config.js';

function dim(ctx, alpha) {
  ctx.fillStyle = `rgba(8, 10, 20, ${alpha})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function title(ctx, text, y, size, color, bold) {
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold' : ''} ${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(text, VIEW_W / 2, y);
}

export function drawTitle(ctx, state, best) {
  dim(ctx, 0.35);
  ctx.fillStyle = PALETTE.carpetEdge;
  ctx.fillRect(VIEW_W / 2 - 150, 148, 300, 2);
  title(ctx, 'VELVET VAULT', 140, 52, PALETTE.gold, true);
  title(ctx, 'One room. Three guards. Two cameras. One diamond.', 178, 18, PALETTE.ink, false);
  title(ctx, 'WASD — move  ·  SHIFT — sneak  ·  Q — coin  ·  E — smoke', 214, 15, PALETTE.inkDim, false);
  title(ctx, 'Press SPACE or click to begin', 262, 18, PALETTE.ink, true);
  if (best > 0) title(ctx, `Best score: ${best}`, 292, 15, PALETTE.inkDim, false);
}

export function drawPaused(ctx) {
  dim(ctx, 0.55);
  title(ctx, 'PAUSED', 330, 48, PALETTE.ink, true);
  title(ctx, 'Press P or SPACE to keep going', 380, 20, PALETTE.inkDim, false);
}

export function drawCaught(ctx, state) {
  dim(ctx, 0.62);
  title(ctx, 'CAUGHT', 300, 56, PALETTE.alarmRed, true);
  title(ctx, 'The alarm hit 100%. The night is over.', 350, 20, PALETTE.ink, false);
  title(ctx, `Score ${state.score}   ·   Time ${Math.floor(state.time)}s   ·   Best route stays open`, 390, 18, PALETTE.inkDim, false);
  title(ctx, 'Press SPACE to try again', 440, 22, PALETTE.ink, true);
}

export function drawWon(ctx, state, best) {
  dim(ctx, 0.45);
  title(ctx, 'CLEAN GETAWAY', 290, 52, PALETTE.exitGreen, true);
  title(ctx, 'The diamond is yours. The vault never knew you were there.', 340, 20, PALETTE.ink, false);
  title(ctx, `Score ${state.score}   ·   Time ${Math.floor(state.time)}s   ·   Peak alarm ${Math.round(state.alarm.peak)}%`, 380, 18, PALETTE.inkDim, false);
  if (state.score >= best) title(ctx, 'A new best score.', 414, 18, PALETTE.gold, true);
  title(ctx, 'Press SPACE to run it again', 460, 22, PALETTE.ink, true);
}
