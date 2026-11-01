// Repetición espaciada tipo Leitner: cada acierto sube de caja y espacia el repaso;
// un fallo regresa la tarjeta a la caja 0 para verla de nuevo en un minuto.
const MIN = 60_000;
const DAY = 86_400_000;

export const INTERVALS = [MIN, 10 * MIN, DAY, 3 * DAY, 7 * DAY, 21 * DAY];
export const MASTERED_BOX = 4;

export function review(card, ok, now) {
  const box = ok ? Math.min((card ? card.box : 0) + 1, INTERVALS.length - 1) : 0;
  return { box, due: now + INTERVALS[box] };
}

// Elige la siguiente tarjeta: prioriza las vencidas (70%), luego las nuevas
// y, si ya se vio todo, las que vencen más pronto. `avoid` evita repetir la anterior.
export function pickKey(keys, cards, now, rng = Math.random, avoid = null) {
  const pool = keys.length > 1 ? keys.filter(k => k !== avoid) : keys;
  const seen = pool.filter(k => cards[k]);
  const due = seen.filter(k => cards[k].due <= now);
  const fresh = pool.filter(k => !cards[k]);
  const byDue = list => [...list].sort((a, b) => cards[a].due - cards[b].due);
  const nearFront = list => list[Math.floor(rng() * Math.min(5, list.length))];

  if (due.length && (!fresh.length || rng() < 0.7)) return nearFront(byDue(due));
  if (fresh.length) return fresh[Math.floor(rng() * fresh.length)];
  return nearFront(byDue(seen));
}

export const dueCount = (cards, now) =>
  Object.values(cards).filter(c => c.due <= now).length;

export const masteredCount = cards =>
  Object.values(cards).filter(c => c.box >= MASTERED_BOX).length;
