import { state } from '../core/store.js';
import { errorKeys } from '../core/srs.js';
import { tr } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { backLink, viewHead, optionShortcuts } from '../ui/components.js';
import { conjQuestion, choiceQuestion, questionFromKey, pickForm } from '../ui/questions.js';

// Repite solo lo que fallaste, con el mismo tipo de ejercicio en que lo fallaste
export const reviewKeys = () => errorKeys(state.cards).filter(k => questionFromKey(k));

export default function review(el) {
  let lastKey = null;

  el.innerHTML = `
    ${backLink('#/practice', tr('nav_practice'))}
    ${viewHead(tr('nav_review'), tr('mode_review_desc'))}
    <p class="muted small" id="left"></p>
    <div class="card quiz" id="card"></div>`;

  const card = el.querySelector('#card');
  const left = el.querySelector('#left');

  function next() {
    const keys = reviewKeys();
    left.textContent = keys.length ? tr('review_left', { n: keys.length }) : '';

    if (!keys.length) {
      card.innerHTML = `
        <div class="center-card">
          <span class="big-icon ok">${icon('Trophy', 40)}</span>
          <p>${tr('review_empty')}</p>
          <a class="btn primary" href="#/practice">${tr('nav_practice')} ${icon('ArrowRight', 18)}</a>
        </div>`;
      return;
    }

    // La que vence antes, sin repetir la anterior si hay otras
    const candidates = keys.length > 1 ? keys.filter(k => k !== lastKey) : keys;
    const key = candidates.sort((a, b) => state.cards[a].due - state.cards[b].due)[0];
    lastKey = key;

    const mode = key.split('|')[0];
    if (mode === 'conj') conjQuestion(card, questionFromKey(key, 'aff'), { onNext: next });
    else choiceQuestion(card, questionFromKey(key, mode === 'id' ? pickForm('mix') : 'aff'), { onNext: next, listen: mode === 'lis' });
  }

  next();
  return optionShortcuts(card);
}
