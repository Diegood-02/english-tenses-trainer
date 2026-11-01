import { icon } from './icons.js';

export const backLink = (href, label) =>
  `<a class="back" href="${href}">${icon('ArrowLeft', 18)} ${label}</a>`;

export const viewHead = (title, help) => `
  <header class="view-head">
    <h1>${title}</h1>
    ${help ? `<p class="muted">${help}</p>` : ''}
  </header>`;

// items: [[id, etiqueta], …]; cada botón lleva data-<attr>="id"
export const chipRow = (items, active, attr) => items
  .map(([id, label]) => `<button type="button" class="chip-btn ${id === active ? 'active' : ''}" data-${attr}="${id}">${label}</button>`)
  .join('');

// Tarjeta de enlace con icono, título, descripción y dato opcional a la derecha
export const linkCard = ({ href, icon: ic, title, desc, aside = '' }) => `
  <a class="card mode" href="${href}">
    <span class="mode-icon">${icon(ic, 22)}</span>
    <span class="mode-text">
      <b>${title}</b>
      <span class="muted small">${desc}</span>
    </span>
    ${aside ? `<span class="mode-aside">${aside}</span>` : ''}
    <span class="mode-arrow">${icon('ArrowRight', 18)}</span>
  </a>`;

// Atajos 1–4 para elegir opciones; devuelve la función de limpieza
export function optionShortcuts(root) {
  const onKey = e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input, textarea')) return;
    if (!/^[1-4]$/.test(e.key)) return;
    const option = root.querySelectorAll('.option')[Number(e.key) - 1];
    if (option && !option.disabled) option.click();
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}
