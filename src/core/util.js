export const rand = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];

export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

export const normalize = s => s.trim().toLowerCase().replace(/\s+/g, ' ');

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s).replace(/[&<>"']/g, c => ENTITIES[c]);
