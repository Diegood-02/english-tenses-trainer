import { review } from './srs.js';

// Funciones puras sobre el estado de progreso: reciben el estado y devuelven uno nuevo.
export const DAILY_GOAL = 20;
export const XP = { correct: 10, hangmanWin: 15 };

export const defaultState = () => ({
  tenses: {},
  hangman: { won: 0, lost: 0 },
  cards: {},
  xp: 0,
  streak: { count: 0, last: null },
  daily: { date: null, count: 0 },
});

const pad = n => String(n).padStart(2, '0');

export const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

export function touchStreak(streak, today) {
  if (streak.last === today) return streak;
  if (streak.last === addDays(today, -1)) return { count: streak.count + 1, last: today };
  return { count: 1, last: today };
}

// La racha sigue viva si practicaste hoy o ayer
export function currentStreak(streak, today) {
  return streak.last === today || streak.last === addDays(today, -1) ? streak.count : 0;
}

// Nivel n empieza en 50·n·(n-1) XP: 0, 100, 300, 600, 1000…
const threshold = level => 50 * level * (level - 1);

export function levelInfo(xp) {
  let level = 1;
  while (xp >= threshold(level + 1)) level++;
  const base = threshold(level);
  return { level, into: xp - base, span: threshold(level + 1) - base };
}

export const dailyCount = (s, today) => (s.daily.date === today ? s.daily.count : 0);

const bumpDaily = (daily, today, n) =>
  ({ date: today, count: (daily.date === today ? daily.count : 0) + n });

export function applyAnswer(s, { tenseId, key, ok, now }) {
  const today = dayKey(new Date(now));
  const stat = s.tenses[tenseId] || { ok: 0, total: 0 };
  return {
    ...s,
    tenses: { ...s.tenses, [tenseId]: { ok: stat.ok + (ok ? 1 : 0), total: stat.total + 1 } },
    cards: { ...s.cards, [key]: review(s.cards[key], ok, now) },
    xp: s.xp + (ok ? XP.correct : 0),
    daily: bumpDaily(s.daily, today, ok ? 1 : 0),
    streak: touchStreak(s.streak, today),
  };
}

export function applyHangman(s, won, now) {
  const today = dayKey(new Date(now));
  return {
    ...s,
    hangman: { ...s.hangman, [won ? 'won' : 'lost']: s.hangman[won ? 'won' : 'lost'] + 1 },
    xp: s.xp + (won ? XP.hangmanWin : 0),
    daily: bumpDaily(s.daily, today, won ? 1 : 0),
    streak: touchStreak(s.streak, today),
  };
}

// Tiempos con menor precisión (mínimo `minTotal` respuestas)
export function weakTenses(stats, limit, minTotal = 3) {
  return Object.entries(stats)
    .filter(([, s]) => s.total >= minTotal && s.ok < s.total)
    .map(([id, s]) => ({ id, pct: Math.round((s.ok / s.total) * 100) }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, limit);
}
