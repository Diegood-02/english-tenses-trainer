import confetti from 'canvas-confetti';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reinicia una animación CSS aunque ya se haya aplicado antes
export function animate(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

export function celebrate() {
  if (reducedMotion()) return;
  confetti({
    particleCount: 90,
    spread: 75,
    origin: { y: 0.65 },
    colors: ['#4f46e5', '#818cf8', '#f97316', '#22c55e', '#facc15'],
  });
}

export function floatText(anchor, text) {
  const span = document.createElement('span');
  span.className = 'float-xp';
  span.textContent = text;
  anchor.append(span);
  span.addEventListener('animationend', () => span.remove());
}

let toastTimer;
export function toast(text) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// Barras y anillos se llenan con transición: el valor final va en data-width / data-offset
export function fillBars(root) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.querySelectorAll('[data-width]').forEach(b => { b.style.width = `${b.dataset.width}%`; });
    root.querySelectorAll('[data-offset]').forEach(c => { c.style.strokeDashoffset = c.dataset.offset; });
  }));
}
