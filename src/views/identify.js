import { state } from '../core/store.js';
import { TENSES, TENSE_BY_ID, SUBJECTS, poolKeys } from '../core/tenses.js';
import { VERB_BY_BASE } from '../data/verbs.js';
import { pickKey } from '../core/srs.js';
import { rand, shuffle, cap, esc } from '../core/util.js';
import { tr, tenseName, lang } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speakButton } from '../ui/speech.js';
import { recordAnswer, comboBadge, refreshCombo } from '../ui/practice.js';

// Distractores parecidos (mismo tiempo o mismo aspecto) para que la elección enseñe algo
function distractors(tense) {
  const others = TENSES.filter(t => t !== tense);
  const similar = shuffle(others.filter(t => t.time === tense.time || t.aspect === tense.aspect));
  const rest = shuffle(others.filter(t => !similar.includes(t)));
  return [...similar, ...rest].slice(0, 3);
}

export default function identify(el) {
  let current = null;
  let answered = false;

  el.innerHTML = `
    <header class="view-head">
      <h1>${tr('nav_identify')}</h1>
      <p class="muted">${tr('identify_help')}</p>
    </header>
    <div class="card quiz" id="card"></div>`;

  const card = el.querySelector('#card');

  function next() {
    const key = pickKey(poolKeys('id', TENSES), state.cards, Date.now(), Math.random, current?.key);
    const [, base, tenseId] = key.split('|');
    const v = VERB_BY_BASE[base];
    const tense = TENSE_BY_ID[tenseId];
    const s = rand(SUBJECTS);
    const phrase = tense.phrase(v, s);
    const marker = rand(tense.markers);
    const sentence = `${cap(s)} ${phrase} ${marker}.`;
    const options = shuffle([tense, ...distractors(tense)]);
    current = { key, tense };
    answered = false;

    card.innerHTML = `
      <div class="quiz-top">
        <span class="pill">${tr('identify_q')}</span>
        ${comboBadge()}
      </div>
      <p class="prompt sentence">
        <span>${cap(s)} <mark>${esc(phrase)}</mark> ${esc(marker)}.</span>
        ${speakButton(sentence)}
      </p>
      <p class="muted meaning">${v.base} · ${v.es}</p>
      <div class="options" id="opts">
        ${options.map((t, i) => `
          <button class="option" data-id="${t.id}"><kbd>${i + 1}</kbd>${tenseName(t)}</button>`).join('')}
      </div>
      <div class="feedback" id="fb" aria-live="polite"></div>
      <button class="btn primary" id="btn" hidden>${tr('next')} ${icon('ArrowRight', 18)}</button>`;

    card.querySelector('#opts').onclick = e => {
      const b = e.target.closest('[data-id]');
      if (b) choose(b);
    };
    card.querySelector('#btn').onclick = next;
  }

  function choose(button) {
    if (answered) return;
    answered = true;
    const ok = button.dataset.id === current.tense.id;

    card.querySelectorAll('.option').forEach(o => {
      o.disabled = true;
      if (o.dataset.id === current.tense.id) o.classList.add('is-ok');
    });
    if (!ok) button.classList.add('is-bad');

    card.querySelector('#fb').innerHTML = `
      <p class="${ok ? 'ok' : 'bad'} verdict">${icon(ok ? 'Check' : 'X', 18)}
        ${ok ? tr('correct') : `${tr('wrong')} ${tr('answer')}: <b>${tenseName(current.tense)}</b>`}</p>
      <p class="muted small">${tr('formula')}: ${current.tense.formula[lang]}</p>`;
    const btn = card.querySelector('#btn');
    btn.hidden = false;
    btn.focus();

    recordAnswer({ ok, tenseId: current.tense.id, key: current.key, card });
    refreshCombo(card);
  }

  const onKey = e => {
    if (answered || e.ctrlKey || e.metaKey || e.altKey || !/^[1-4]$/.test(e.key)) return;
    const option = card.querySelectorAll('.option')[Number(e.key) - 1];
    if (option) choose(option);
  };
  document.addEventListener('keydown', onKey);

  next();
  return () => document.removeEventListener('keydown', onKey);
}
