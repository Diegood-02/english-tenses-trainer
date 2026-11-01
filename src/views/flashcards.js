import { state } from '../core/store.js';
import { pickKey } from '../core/srs.js';
import { XP } from '../core/progress.js';
import { VERB_BY_BASE } from '../data/verbs.js';
import { tr } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speakButton } from '../ui/speech.js';
import { backLink, viewHead, chipRow } from '../ui/components.js';
import { recordAnswer } from '../ui/practice.js';
import { levelVerbs } from '../ui/level.js';

const FILTERS = ['irregular', 'all'];

export default function flashcards(el) {
  let filter = 'irregular';
  let current = null;
  let flipped = false;

  el.innerHTML = `
    ${backLink('#/learn', tr('nav_learn'))}
    ${viewHead(tr('nav_flashcards'), tr('fc_help'))}
    <div class="chips" id="chips"></div>
    <div class="fc-stage" id="stage"></div>`;

  const chips = el.querySelector('#chips');
  const stage = el.querySelector('#stage');

  const drawChips = () => { chips.innerHTML = chipRow(FILTERS.map(f => [f, tr(f)]), filter, 'filter'); };

  chips.onclick = e => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    drawChips();
    next();
  };

  function next() {
    const verbs = levelVerbs().filter(v => filter === 'all' || v.irregular);
    const key = pickKey(verbs.map(v => `card|${v.base}`), state.cards, Date.now(), Math.random, current?.key);
    const v = VERB_BY_BASE[key.split('|')[1]];
    current = { key, v };
    flipped = false;

    stage.innerHTML = `
      <button type="button" class="flashcard" id="fc" aria-label="${tr('flip')}">
        <span class="fc-inner">
          <span class="fc-face fc-front">
            <span class="muted small">${tr('form_base')}</span>
            <b class="fc-word">${v.base}</b>
            <span class="muted">${v.es}</span>
            <span class="fc-hint muted small">${icon('RotateCcw', 14)} ${tr('flip')}</span>
          </span>
          <span class="fc-face fc-back">
            <span class="fc-forms">
              <span><span class="muted small">${tr('form_past')}</span><b>${v.pastLabel}</b></span>
              <span><span class="muted small">${tr('form_pp')}</span><b>${v.pp}</b></span>
            </span>
            <span class="muted small">${v.base} · ${v.pastLabel} · ${v.pp}</span>
          </span>
        </span>
      </button>
      <div class="fc-actions" id="actions" hidden>
        ${speakButton(`${v.base}, ${v.past}, ${v.pp}`)}
        <button type="button" class="btn bad-btn" id="no"><kbd>1</kbd>${tr('didnt')}</button>
        <button type="button" class="btn ok-btn" id="yes"><kbd>2</kbd>${tr('knew')}</button>
      </div>`;

    stage.querySelector('#fc').onclick = flip;
    stage.querySelector('#no').onclick = () => grade(false);
    stage.querySelector('#yes').onclick = () => grade(true);
  }

  let busy = false;

  function flip() {
    if (flipped || busy) return;
    flipped = true;
    stage.querySelector('#fc').classList.add('flipped');
    stage.querySelector('#actions').hidden = false;
  }

  // busy evita calificar dos veces la misma tarjeta mientras aparece la siguiente
  function grade(ok) {
    if (!flipped || busy) return;
    busy = true;
    recordAnswer({ ok, key: current.key, card: stage.querySelector('#fc'), xp: XP.flashcard });
    timer = setTimeout(() => {
      busy = false;
      next();
    }, 250);
  }

  let timer = null;

  const onKey = e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flip();
    } else if (e.key === '1') grade(false);
    else if (e.key === '2') grade(true);
  };
  document.addEventListener('keydown', onKey);

  drawChips();
  next();
  return () => {
    clearTimeout(timer);
    document.removeEventListener('keydown', onKey);
  };
}
