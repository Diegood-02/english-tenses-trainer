import { tr, tenseName } from '../i18n.js';

// Línea de tiempo: punto de referencia (pasado, ahora o futuro) y la forma según el aspecto.
// simple = punto · continuo = franja · perfecto = arco desde antes · perfecto continuo = franja hasta la referencia
const X = { past: 72, pres: 160, fut: 248 };
const Y = 50;

const SHAPES = {
  simple: r => `<circle class="tl-mark" cx="${r}" cy="${Y}" r="7" />`,
  cont: r => `<rect class="tl-band" x="${r - 30}" y="${Y - 7}" width="60" height="14" rx="7" />`,
  perf: r => `
    <circle class="tl-mark soft" cx="${r - 58}" cy="${Y}" r="6" />
    <path class="tl-arc" d="M${r - 58} ${Y - 8} Q${r - 29} ${Y - 40} ${r - 3} ${Y - 10}" marker-end="url(#tl-arrow)" />`,
  perf_cont: r => `
    <rect class="tl-band" x="${r - 58}" y="${Y - 7}" width="58" height="14" rx="7" />
    <circle class="tl-mark" cx="${r}" cy="${Y}" r="7" />`,
};

export function timeline(tense) {
  const r = X[tense.time];
  return `
    <svg class="timeline" viewBox="0 0 320 92" role="img" aria-label="${tenseName(tense)}">
      <defs>
        <marker id="tl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" class="tl-arrowhead" />
        </marker>
      </defs>
      <line class="tl-axis" x1="8" y1="${Y}" x2="306" y2="${Y}" />
      <path class="tl-axis" d="M300 ${Y - 5} L307 ${Y} L300 ${Y + 5}" />
      ${Object.entries(X).map(([time, x]) => `
        <line class="tl-tick" x1="${x}" y1="${Y + 9}" x2="${x}" y2="${Y + 15}" />
        <text class="tl-label ${time === tense.time ? 'on' : ''}" x="${x}" y="${Y + 34}">${tr(`tl_${time}`)}</text>`).join('')}
      <line class="tl-ref" x1="${r}" y1="8" x2="${r}" y2="${Y + 15}" />
      ${SHAPES[tense.aspect](r)}
    </svg>`;
}
