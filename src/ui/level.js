import { loadString, saveString } from '../core/storage.js';
import { LEVELS, tensesFor, verbsFor } from '../core/tenses.js';
import { tr } from '../i18n.js';

// Nivel MCER elegido; por defecto B2 (todo el contenido)
const saved = loadString('ett-level', 'B2');
export let level = LEVELS.includes(saved) ? saved : 'B2';

export function setLevel(next) {
  level = next;
  saveString('ett-level', next);
}

export const levelTenses = () => tensesFor(level);
export const levelVerbs = () => verbsFor(level);

export const levelPicker = () => `
  <div class="level-picker" role="group" aria-label="${tr('cefr')}">
    ${LEVELS.map(l => `<button type="button" class="level-btn ${l === level ? 'active' : ''}" data-level="${l}" aria-pressed="${l === level}">${l}</button>`).join('')}
  </div>`;

export const levelBadge = l => `<span class="level-badge level-${l}">${l}</span>`;
