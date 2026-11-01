import { state } from '../core/store.js';
import { poolKeys } from '../core/tenses.js';
import { pickKey } from '../core/srs.js';
import { tr } from '../i18n.js';
import { backLink, viewHead, optionShortcuts } from '../ui/components.js';
import { choiceQuestion, questionFromKey, pickForm } from '../ui/questions.js';
import { levelTenses, levelVerbs } from '../ui/level.js';

// Sirve para Identificar (oración escrita) y Escuchar (solo audio)
function chooseTense(el, { prefix, listen }) {
  let lastKey = null;

  el.innerHTML = `
    ${backLink('#/practice', tr('nav_practice'))}
    ${viewHead(tr(listen ? 'nav_listening' : 'nav_identify'), tr(listen ? 'listen_help' : 'identify_help'))}
    <div class="card quiz" id="card"></div>`;

  const card = el.querySelector('#card');

  function next() {
    const key = pickKey(poolKeys(prefix, levelTenses(), levelVerbs()), state.cards, Date.now(), Math.random, lastKey);
    lastKey = key;
    choiceQuestion(card, questionFromKey(key, listen ? 'aff' : pickForm('mix')), { onNext: next, listen });
  }

  next();
  return optionShortcuts(card);
}

export const identify = el => chooseTense(el, { prefix: 'id', listen: false });
export const listening = el => chooseTense(el, { prefix: 'lis', listen: true });
