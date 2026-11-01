import { state } from '../core/store.js';
import { TENSES, TENSE_BY_ID, SUBJECTS, poolKeys } from '../core/tenses.js';
import { VERB_BY_BASE } from '../data/verbs.js';
import { pickKey } from '../core/srs.js';
import { rand, cap, normalize, esc } from '../core/util.js';
import { tr, tenseName, lang } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speakButton } from '../ui/speech.js';
import { recordAnswer, comboBadge, refreshCombo } from '../ui/practice.js';

export default function conjugate(el, param) {
  let filter = TENSE_BY_ID[param] ? param : 'all';
  let current = null;
  let answered = false;

  el.innerHTML = `
    <header class="view-head">
      <h1>${tr('nav_conjugate')}</h1>
      <p class="muted">${tr('conj_help')}</p>
    </header>
    <div class="chips" id="chips"></div>
    <div class="card quiz" id="card"></div>`;

  const chips = el.querySelector('#chips');
  const card = el.querySelector('#card');

  function drawChips() {
    chips.innerHTML = [['all', tr('all')], ...TENSES.map(t => [t.id, tenseName(t)])]
      .map(([id, label]) => `<button class="chip-btn ${id === filter ? 'active' : ''}" data-filter="${id}">${label}</button>`)
      .join('');
  }

  chips.onclick = e => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    drawChips();
    next();
  };

  function next() {
    const tenses = filter === 'all' ? TENSES : [TENSE_BY_ID[filter]];
    const key = pickKey(poolKeys('conj', tenses), state.cards, Date.now(), Math.random, current?.key);
    const [, base, tenseId] = key.split('|');
    const v = VERB_BY_BASE[base];
    const tense = TENSE_BY_ID[tenseId];
    const s = rand(SUBJECTS);
    current = { key, v, tense, s, answer: tense.phrase(v, s) };
    answered = false;

    card.innerHTML = `
      <div class="quiz-top">
        <span class="pill">${tenseName(tense)}</span>
        ${comboBadge()}
      </div>
      <p class="prompt">
        <span class="subject">${cap(s)}</span>
        <span class="verb">${v.base}</span>
        ${speakButton(v.base)}
      </p>
      <p class="muted meaning">
        ${v.es}
        <button type="button" class="link" id="hint">${icon('Lightbulb', 16)} ${tr('hint')}</button>
      </p>
      <p class="hint-text" id="hint-text" hidden>${tense.formula[lang]}</p>
      <form class="answer" id="form" autocomplete="off">
        <input id="ans" autocapitalize="off" autocorrect="off" spellcheck="false"
          placeholder="${tr('type_answer')}" aria-label="${tr('type_answer')}">
        <button class="btn primary" id="btn">${tr('check')}</button>
      </form>
      <div class="feedback" id="fb" aria-live="polite"></div>`;

    card.querySelector('#hint').onclick = e => {
      card.querySelector('#hint-text').hidden = false;
      e.currentTarget.hidden = true;
    };
    card.querySelector('#form').onsubmit = submit;
    card.querySelector('#ans').focus();
  }

  function submit(e) {
    e.preventDefault();
    if (answered) return next();
    const input = card.querySelector('#ans');
    if (!input.value.trim()) return input.focus();

    answered = true;
    const ok = normalize(input.value) === current.answer;
    input.readOnly = true;
    input.classList.add(ok ? 'is-ok' : 'is-bad');

    const full = `${cap(current.s)} ${current.answer}`;
    card.querySelector('#fb').innerHTML = `
      <p class="${ok ? 'ok' : 'bad'} verdict">${icon(ok ? 'Check' : 'X', 18)} ${ok ? tr('correct') : tr('wrong')}</p>
      <p class="full">${esc(full)} ${speakButton(full)}</p>
      <p class="muted small">${tenseName(current.tense)} · ${current.tense.formula[lang]}</p>`;
    const btn = card.querySelector('#btn');
    btn.textContent = tr('next');
    btn.focus();

    recordAnswer({ ok, tenseId: current.tense.id, key: current.key, card });
    refreshCombo(card);
  }

  drawChips();
  next();
}
