import { state, commit } from '../core/store.js';
import {
  applyAnswer, applyHangman, dailyCount, dayKey, levelInfo, DAILY_GOAL, XP,
} from '../core/progress.js';
import { animate, celebrate, floatText, toast } from './effects.js';
import { icon } from './icons.js';
import { tr } from '../i18n.js';

// Aciertos seguidos en la sesión actual (no se guarda)
let combo = 0;

export function recordAnswer({ ok, tenseId, key, card }) {
  const now = Date.now();
  const before = snapshot(now);
  commit(applyAnswer(state, { tenseId, key, ok, now }));
  combo = ok ? combo + 1 : 0;
  reward({ ok, card, gained: ok ? XP.correct : 0, before, now });
}

export function recordHangmanResult(won, card) {
  const now = Date.now();
  const before = snapshot(now);
  commit(applyHangman(state, won, now));
  reward({ ok: won, card, gained: won ? XP.hangmanWin : 0, before, now });
}

const snapshot = now => ({
  daily: dailyCount(state, dayKey(new Date(now))),
  level: levelInfo(state.xp).level,
});

function reward({ ok, card, gained, before, now }) {
  animate(card, ok ? 'pop' : 'shake');
  if (gained) floatText(card, `+${gained} XP`);

  const after = snapshot(now);
  if (after.level > before.level) {
    celebrate();
    toast(tr('level_up', { n: after.level }));
  } else if (before.daily < DAILY_GOAL && after.daily >= DAILY_GOAL) {
    celebrate();
    toast(tr('goal_done'));
  } else if (ok && combo > 0 && combo % 5 === 0) {
    celebrate();
    toast(tr('combo_toast', { n: combo }));
  }
}

export const comboBadge = () =>
  `<span class="combo ${combo >= 2 ? 'on' : ''}" data-combo>${combo >= 2 ? `${icon('Zap', 14)} ×${combo}` : ''}</span>`;

export function refreshCombo(root) {
  const el = root.querySelector('[data-combo]');
  if (el) el.outerHTML = comboBadge();
}
