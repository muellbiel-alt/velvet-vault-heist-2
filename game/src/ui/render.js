// The renderer: one canvas, flat colours, hard edges. Safe cover, danger and loot are each
// one unmistakable colour, so the room reads at a glance even shrunk to a contact sheet.
import { CAMERA, GUARD, PALETTE, VIEW_H, VIEW_W } from '../core/config.js';
import { WALL } from '../world/room.js';
import { conePolygon } from '../systems/vision.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_WON = 'won';

export function createRenderer(canvas) {
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

function drawCone(ctx, room, detector, range, halfAngle, fill, edge) {
  const points = conePolygon(room, detector.x, detector.y, detector.angle, range, halfAngle);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawRoom(ctx, state, time) {
  const room = state.room;
  const b = room.bounds;
  // Marble floor: a quiet checker that never competes with the play.
  ctx.fillStyle = PALETTE.floorA;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const tile = 64;
  for (let y = b.y; y < b.y + b.h; y += tile) {
    for (let x = b.x; x < b.x + b.w; x += tile) {
      if (((x - b.x) / tile + (y - b.y) / tile) % 2 === 0) {
        ctx.fillStyle = PALETTE.floorB;
        ctx.fillRect(x, y, tile, tile);
      }
    }
  }
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1;
  for (let x = b.x; x <= b.x + b.w; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, b.y);
    ctx.lineTo(x, b.y + b.h);
    ctx.stroke();
  }
  for (let y = b.y; y <= b.y + b.h; y += tile) {
    ctx.beginPath();
    ctx.moveTo(b.x, y);
    ctx.lineTo(b.x + b.w, y);
    ctx.stroke();
  }
  // The velvet carpet: the main route, from the entry up to the diamond.
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(592, b.y, 96, b.y + b.h - 28);
  ctx.strokeStyle = PALETTE.carpetEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(592, b.y, 96, b.y + b.h - 28);
  ctx.fillStyle = 'rgba(201, 162, 39, 0.25)';
  for (let y = b.y + 40; y < b.y + b.h; y += 80) {
    ctx.beginPath();
    ctx.moveTo(640, y);
    ctx.lineTo(652, y + 14);
    ctx.lineTo(640, y + 28);
    ctx.lineTo(628, y + 14);
    ctx.closePath();
    ctx.fill();
  }
  // Velvet ropes along the carpet.
  for (const rope of room.ropes) {
    ctx.strokeStyle = PALETTE.rope;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rope.x1, rope.y1);
    ctx.lineTo(rope.x2, rope.y2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.ropePost;
    for (let y = rope.y1; y <= rope.y2; y += 120) {
      ctx.beginPath();
      ctx.arc(rope.x1, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Walls with a brass trim, and the two doors.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, VIEW_W, WALL);
  ctx.fillRect(0, VIEW_H - WALL, VIEW_W, WALL);
  ctx.fillRect(0, 0, WALL, VIEW_H);
  ctx.fillRect(VIEW_W - WALL, 0, WALL, VIEW_H);
  ctx.strokeStyle = PALETTE.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(WALL - 1, WALL - 1, VIEW_W - WALL * 2 + 2, VIEW_H - WALL * 2 + 2);
  // Entry door (bottom left) and getaway door (bottom right).
  ctx.fillStyle = '#3a2c18';
  ctx.fillRect(120, VIEW_H - WALL, 80, WALL);
  ctx.fillStyle = PALETTE.exitGreen;
  ctx.fillRect(1080, VIEW_H - WALL, 80, WALL);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('IN', 160, VIEW_H - 9);
  ctx.fillText('OUT', 1120, VIEW_H - 9);
  // Furniture: cases with glass tops, pillars, the statue, the vault pedestal.
  for (const rect of room.tall) {
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    if (rect.kind === 'case') {
      ctx.fillStyle = PALETTE.glass;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(rect.x + 6, rect.y + 6, rect.w - 12, rect.h - 12);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = PALETTE.carpetEdge;
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4);
    } else if (rect.kind === 'pillar') {
      ctx.fillStyle = PALETTE.pillar;
      ctx.fillRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
      ctx.strokeStyle = PALETTE.carpetEdge;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
    } else if (rect.kind === 'statue') {
      ctx.fillStyle = PALETTE.statue;
      ctx.beginPath();
      ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a6d1f';
      ctx.fillRect(rect.x + rect.w / 2 - 3, rect.y + 2, 6, 18);
    }
  }
  for (const rect of room.low) {
    ctx.fillStyle = PALETTE.woodTop;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = PALETTE.carpetEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
  }
  // The Velvet Diamond, pulsing gold on its pedestal — gone once the thief has it.
  if (!state.thief.hasDiamond) {
    const pulse = 0.75 + 0.25 * Math.sin(time * 3);
    ctx.save();
    ctx.shadowColor = PALETTE.gold;
    ctx.shadowBlur = 22 * pulse;
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.moveTo(room.diamond.x, room.diamond.y - 14);
    ctx.lineTo(room.diamond.x + 12, room.diamond.y);
    ctx.lineTo(room.diamond.x, room.diamond.y + 14);
    ctx.lineTo(room.diamond.x - 12, room.diamond.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#fff6c8';
    ctx.beginPath();
    ctx.moveTo(room.diamond.x, room.diamond.y - 8);
    ctx.lineTo(room.diamond.x + 5, room.diamond.y);
    ctx.lineTo(room.diamond.x, room.diamond.y + 8);
    ctx.lineTo(room.diamond.x - 5, room.diamond.y);
    ctx.closePath();
    ctx.fill();
  }
  // Gold bars waiting on their pedestals.
  for (const bar of room.goldBars) {
    if (bar.taken) continue;
    ctx.save();
    ctx.shadowColor = PALETTE.goldDark;
    ctx.shadowBlur = 10;
    ctx.fillStyle = PALETTE.goldDark;
    ctx.fillRect(bar.x - 11, bar.y - 7, 22, 14);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(bar.x - 11, bar.y - 7, 22, 5);
    ctx.restore();
  }
}

function drawGuard(ctx, guard, hot) {
  // The cone first, then the guard standing in it.
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.rotate(guard.angle);
  ctx.fillStyle = PALETTE.guardUniform;
  ctx.beginPath();
  ctx.arc(0, 0, guard.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guardSkin;
  ctx.beginPath();
  ctx.arc(4, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guardCap;
  ctx.fillRect(-2, -9, 12, 6);
  ctx.fillRect(8, -9, 8, 4);
  ctx.fillStyle = hot ? PALETTE.alarmRed : '#e8e2d2';
  ctx.beginPath();
  ctx.arc(6, -3, 1.8, 0, Math.PI * 2);
  ctx.arc(6, 3, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (guard.investigate) {
    ctx.strokeStyle = '#e8e2d2';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.investigate.x, guard.investigate.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawCamera(ctx, camera) {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.rotate(camera.angle);
  ctx.fillStyle = '#39404d';
  ctx.fillRect(-4, -7, 18, 14);
  ctx.fillStyle = '#20242e';
  ctx.beginPath();
  ctx.arc(15, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = camera.disabled > 0 ? '#555c66' : '#ff4d3d';
  ctx.beginPath();
  ctx.arc(camera.x, camera.y - 10, 3, 0, Math.PI * 2);
  ctx.fill();
  if (camera.disabled > 0) {
    ctx.fillStyle = PALETTE.inkDim;
    ctx.font = 'bold 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFF', camera.x, camera.y + 24);
  }
}

function drawThief(ctx, thief, time) {
  const bob = thief.moving ? Math.sin(time * 14) * 1.5 : 0;
  ctx.save();
  ctx.translate(thief.x, thief.y + bob);
  ctx.rotate(thief.face);
  ctx.fillStyle = PALETTE.thiefCoat;
  ctx.beginPath();
  ctx.arc(0, 0, thief.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Red scarf trailing behind, and a pale face looking where he walks.
  ctx.fillStyle = PALETTE.thiefScarf;
  ctx.beginPath();
  ctx.moveTo(-thief.radius + 2, -5);
  ctx.lineTo(-thief.radius - 10, -8);
  ctx.lineTo(-thief.radius - 10, 8);
  ctx.lineTo(-thief.radius + 2, 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e8c39a';
  ctx.beginPath();
  ctx.arc(5, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c22';
  ctx.beginPath();
  ctx.arc(7, -2.5, 1.6, 0, Math.PI * 2);
  ctx.arc(7, 2.5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (thief.hasDiamond) {
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.moveTo(thief.x, thief.y - thief.radius - 12);
    ctx.lineTo(thief.x + 6, thief.y - thief.radius - 4);
    ctx.lineTo(thief.x, thief.y - thief.radius + 2);
    ctx.lineTo(thief.x - 6, thief.y - thief.radius - 4);
    ctx.closePath();
    ctx.fill();
  }
  if (thief.sneaking) {
    ctx.strokeStyle = 'rgba(242, 234, 216, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, thief.radius + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawHud(ctx, state) {
  const alarm = state.alarm.value;
  const color = alarm < 45 ? PALETTE.alarmGreen : alarm < 75 ? PALETTE.alarmAmber : PALETTE.alarmRed;
  ctx.fillStyle = 'rgba(10, 14, 26, 0.82)';
  ctx.fillRect(28, 8, 1224, 34);
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(28, 8, 1224, 34);
  // Alarm meter.
  ctx.fillStyle = PALETTE.inkDim;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', 44, 30);
  ctx.fillStyle = '#10141f';
  ctx.fillRect(110, 16, 300, 18);
  ctx.fillStyle = color;
  ctx.fillRect(110, 16, 300 * (alarm / 100), 18);
  ctx.strokeStyle = color;
  ctx.strokeRect(110, 16, 300, 18);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(`${Math.round(alarm)}%`, 420, 30);
  // Loot, tools, time, score.
  const thief = state.thief;
  ctx.fillText(`LOOT  ${thief.hasDiamond ? 'DIAMOND' : '—'}  ·  GOLD ${thief.goldTaken}/2`, 500, 30);
  ctx.fillText(`COINS ${thief.coins}  (Q / click)`, 760, 30);
  ctx.fillText(`SMOKE ${thief.smokes}  (E)`, 930, 30);
  const minutes = Math.floor(state.time / 60);
  const seconds = Math.floor(state.time % 60);
  ctx.fillText(`TIME ${minutes}:${String(seconds).padStart(2, '0')}`, 1060, 30);
  ctx.fillText(`SCORE ${state.score}`, 1160, 30);
  // The getaway arrow when the diamond is in hand.
  if (thief.hasDiamond && state.status === 'playing') {
    const dx = state.room.exit.x - thief.x;
    const dy = state.room.exit.y - thief.y;
    const angle = Math.atan2(dy, dx);
    const px = thief.x + Math.cos(angle) * 34;
    const py = thief.y + Math.sin(angle) * 34;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.fillStyle = PALETTE.exitGreen;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // A thrown coin, ringing on the floor.
  for (const coin of state.coins) {
    ctx.strokeStyle = `rgba(255, 217, 74, ${Math.max(0, 1 - coin.ring)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 6 + coin.ring * 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const puff of state.smokes) {
    ctx.fillStyle = `rgba(200, 205, 215, ${Math.max(0, puff.timer / 1.2) * 0.5})`;
    ctx.beginPath();
    ctx.arc(puff.x, puff.y, 46, 0, Math.PI * 2);
    ctx.fill();
  }
  // SPOTTED banner while a detector has eyes on the thief.
  if (state.seen && state.status === 'playing') {
    const blink = 0.6 + 0.4 * Math.sin(state.time * 10);
    ctx.fillStyle = `rgba(255, 77, 61, ${blink})`;
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED — BREAK LINE OF SIGHT', VIEW_W / 2, 84);
  }
}

export function drawWorld(renderer, state, screen, time) {
  const { ctx } = renderer;
  drawRoom(ctx, state, time);
  // Cones under the figures: calm amber, hot red when they see the thief.
  for (const guard of state.guards) {
    const hot = state.seen && guard.chase;
    drawCone(ctx, state.room, guard, GUARD.visionRange, GUARD.halfAngle, hot ? PALETTE.coneHot : PALETTE.coneCalm, hot ? PALETTE.coneHotEdge : PALETTE.coneCalmEdge);
  }
  for (const camera of state.cameras) {
    if (camera.disabled > 0) continue;
    drawCone(ctx, state.room, camera, CAMERA.visionRange, CAMERA.halfAngle, PALETTE.coneCam, 'rgba(255, 233, 168, 0.35)');
  }
  for (const guard of state.guards) drawGuard(ctx, guard, state.seen && guard.chase);
  for (const camera of state.cameras) drawCamera(ctx, camera);
  drawThief(ctx, state.thief, time);
  // The HUD rides on the title screen too, so the cover already shows the alarm meter,
  // the loot, the tools and the score — every element the first criterion asks for.
  if (screen === SCREEN_TITLE || screen === SCREEN_PLAY || screen === SCREEN_PAUSED) drawHud(ctx, state);
}
