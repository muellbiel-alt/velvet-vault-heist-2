// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps
// (several in a slow frame, none in a fast one), and the renderer paints what is there. The game
// moves between five screens: title, play, paused, caught and the getaway.
//
// ?seed=N fixes the night's small variations. ?shot=start|play|alert|end (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets window.__shotReady.
import { STEP } from './core/config.js';
import { ACTION_CONFIRM, ACTION_COIN, ACTION_MUTE, ACTION_PAUSE, ACTION_SMOKE, createInput } from './core/input.js';
import { createAudio } from './audio/synth.js';
import { createWorld, resetWorld, stepWorld } from './world/state.js';
import { createRenderer, SCREEN_CAUGHT, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON, drawWorld } from './ui/render.js';
import { drawCaught, drawPaused, drawTitle, drawWon } from './ui/screens.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;
const BEST_KEY = 'velvet-vault-best';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createWorld(seed);
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, state, null);
  let painted = 0;
  function paint() {
    drawWorld(renderer, state, scene.screen, state.time);
    if (scene.screen === SCREEN_TITLE) drawTitle(renderer.ctx, state, scene.best);
    if (scene.screen === SCREEN_WON) drawWon(renderer.ctx, state, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    resetWorld(state);
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Grab the diamond, then slip out the green door.');
  }

  function finishGame(won) {
    screen = won ? SCREEN_WON : SCREEN_CAUGHT;
    if (state.score > best) {
      best = state.score;
      saveBest(best);
    }
    announce(won ? `Clean getaway. Score ${state.score}.` : `Caught. Score ${state.score}.`);
  }

  // One fixed step. `pending` carries this frame's one-shot actions; a coin or a smoke is
  // spent on the first step that sees it, never twice.
  function step(pending) {
    if (screen === SCREEN_TITLE) {
      stepWorld(state, { x: 0, y: 0 }, false, STEP, null, false, null);
      return;
    }
    const click = input.takeClick();
    let coinTarget = null;
    let smoke = false;
    if (!pending.coinUsed && pending.actions & ACTION_COIN && click) {
      coinTarget = click;
      pending.coinUsed = true;
    }
    if (!pending.smokeUsed && pending.actions & ACTION_SMOKE) {
      smoke = true;
      pending.smokeUsed = true;
    }
    stepWorld(state, input.direction(), input.sneaking(), STEP, coinTarget, smoke, audio);
    if (state.status === 'caught') finishGame(false);
    else if (state.status === 'won') finishGame(true);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Muted.' : 'Sound on.');
    }
    // A click on a menu screen starts the game; during play the step loop takes clicks
    // as coin tosses, so they are read here only on menu screens.
    const menuClick = screen === SCREEN_TITLE || screen === SCREEN_CAUGHT || screen === SCREEN_WON ? input.takeClick() : null;
    if ((actions & ACTION_CONFIRM || menuClick) && (screen === SCREEN_TITLE || screen === SCREEN_CAUGHT || screen === SCREEN_WON)) {
      audio.unlock();
      startGame();
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
    const pending = { actions, coinUsed: false, smokeUsed: false };
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step(pending);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    drawWorld(renderer, state, screen, state.time);
    if (screen === SCREEN_TITLE) drawTitle(renderer.ctx, state, best);
    else if (screen === SCREEN_PAUSED) drawPaused(renderer.ctx);
    else if (screen === SCREEN_CAUGHT) drawCaught(renderer.ctx, state);
    else if (screen === SCREEN_WON) drawWon(renderer.ctx, state, best);
  }

  // Leaving the tab pauses a running game rather than letting the alarm climb unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Velvet Vault. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
