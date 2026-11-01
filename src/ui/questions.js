import {
  TENSES, TENSE_BY_ID, SUBJECTS, verbPhrase, clause, clauseParts, sentence, formula, supports,
} from '../core/tenses.js';
import { isCorrect, contract } from '../core/answers.js';
import { VERB_BY_BASE } from '../data/verbs.js';
import { rand, shuffle, cap, esc } from '../core/util.js';
import { tr, tenseName, lang } from '../i18n.js';
import { icon } from './icons.js';
import { speak, speakButton, canSpeak } from './speech.js';
import { recordAnswer, comboBadge, refreshCombo } from './practice.js';

// "mix": mitad afirmativas, un cuarto negativas y un cuarto preguntas
export function pickForm(setting) {
  if (setting !== 'mix') return setting;
  const r = Math.random();
  return r < 0.5 ? 'aff' : r < 0.75 ? 'neg' : 'q';
}

// Convierte una clave "modo|verbo|tiempo" en una pregunta concreta
export function questionFromKey(key, form = 'aff') {
  const [mode, base, tenseId] = key.split('|');
  const v = VERB_BY_BASE[base];
  const tense = TENSE_BY_ID[tenseId];
  if (!v || !tense || !supports(v, tense)) return null;
  return { key, mode, v, tense, s: rand(SUBJECTS), form, marker: rand(tense.markers) };
}

export const sentenceOf = q => sentence(q.tense, q.v, q.s, q.form, q.marker);

export function sentenceHtml(q) {
  const parts = clauseParts(q.tense, q.v, q.s, q.form)
    .map(p => (p.verb ? `<mark>${esc(p.text)}</mark>` : esc(p.text)));
  return `${[...parts, esc(q.v.obj), esc(q.marker)].join(' ')}${q.form === 'q' ? '?' : '.'}`;
}

const formPill = form => (form === 'aff' ? '' : `<span class="pill form-${form}">${tr(`form_${form}`)}</span>`);

const verdict = (ok, extra = '') =>
  `<p class="${ok ? 'ok' : 'bad'} verdict">${icon(ok ? 'Check' : 'X', 18)} ${ok ? tr('correct') : tr('wrong')} ${extra}</p>`;

// Distractores parecidos (mismo tiempo o mismo aspecto) para que la elección enseñe algo
function distractors(tense) {
  const others = TENSES.filter(t => t !== tense);
  const similar = shuffle(others.filter(t => t.time === tense.time || t.aspect === tense.aspect));
  const rest = shuffle(others.filter(t => !similar.includes(t)));
  return [...similar, ...rest].slice(0, 3);
}

const optionsHtml = tense => shuffle([tense, ...distractors(tense)])
  .map((t, i) => `<button class="option" data-id="${t.id}"><kbd>${i + 1}</kbd>${tenseName(t)}</button>`)
  .join('');

// ---------- Conjugar: escribir la forma ----------

export function conjQuestion(card, q, { onNext }) {
  const expected = q.form === 'q' ? clause(q.tense, q.v, q.s, 'q') : verbPhrase(q.tense, q.v, q.s, q.form);
  let answered = false;

  card.innerHTML = `
    <div class="quiz-top">
      <span class="pills"><span class="pill">${tenseName(q.tense)}</span>${formPill(q.form)}</span>
      ${comboBadge()}
    </div>
    <p class="prompt">
      <span class="subject">${cap(q.s)}</span>
      <span class="verb">${q.v.base}</span>
      ${speakButton(q.v.base)}
    </p>
    <p class="muted meaning">
      ${q.v.es}
      <button type="button" class="link" id="hint">${icon('Lightbulb', 16)} ${tr('hint')}</button>
    </p>
    <p class="hint-text" id="hint-text" hidden>${formula(q.tense, q.form, lang)}</p>
    <form class="answer" id="form" autocomplete="off">
      <input id="ans" autocapitalize="off" autocorrect="off" spellcheck="false"
        placeholder="${tr(q.form === 'q' ? 'type_question' : 'type_answer')}" aria-label="${tr('type_answer')}">
      <button class="btn primary" id="btn">${tr('check')}</button>
    </form>
    <div class="feedback" id="fb" aria-live="polite"></div>`;

  const input = card.querySelector('#ans');
  card.querySelector('#hint').onclick = e => {
    card.querySelector('#hint-text').hidden = false;
    e.currentTarget.hidden = true;
  };

  card.querySelector('#form').onsubmit = e => {
    e.preventDefault();
    if (answered) return onNext();
    if (!input.value.trim()) return input.focus();

    answered = true;
    const ok = isCorrect(input.value, expected);
    input.readOnly = true;
    input.classList.add(ok ? 'is-ok' : 'is-bad');

    const full = q.form === 'q' ? `${expected}?` : `${cap(q.s)} ${expected}.`;
    const short = contract(expected);
    card.querySelector('#fb').innerHTML = `
      ${verdict(ok)}
      <p class="full">${esc(full)} ${speakButton(full)}</p>
      ${short !== expected ? `<p class="muted small">${tr('also_valid')}: ${esc(short)}</p>` : ''}
      <p class="muted small">${tenseName(q.tense)} · ${formula(q.tense, q.form, lang)}</p>`;
    const btn = card.querySelector('#btn');
    btn.textContent = tr('next');
    btn.focus();

    recordAnswer({ ok, tenseId: q.tense.id, key: q.key, card });
    refreshCombo(card);
  };

  input.focus();
}

// ---------- Identificar / escuchar: elegir el tiempo ----------
// listen: la oración no se muestra hasta responder; timed: sin explicación y avance automático

export function choiceQuestion(card, q, { onNext, onAnswer, listen = false, timed = false }) {
  const text = sentenceOf(q);
  let answered = false;

  const prompt = listen
    ? `<div class="listen-box">
        <button type="button" class="btn primary play" id="play">${icon('Volume2', 20)} ${tr('listen_play')}</button>
        <button type="button" class="btn" id="slow">${icon('Snail', 18)} ${tr('listen_slow')}</button>
      </div>
      <p class="prompt sentence" id="reveal" hidden><span>${sentenceHtml(q)}</span></p>`
    : `<p class="prompt sentence"><span>${sentenceHtml(q)}</span>${timed ? '' : speakButton(text)}</p>
      ${timed ? '' : `<p class="muted meaning">${q.v.base} · ${q.v.es}</p>`}`;

  card.innerHTML = `
    <div class="quiz-top">
      <span class="pills"><span class="pill">${tr('identify_q')}</span>${listen ? '' : formPill(q.form)}</span>
      ${comboBadge()}
    </div>
    ${prompt}
    <div class="options" id="opts">${optionsHtml(q.tense)}</div>
    <div class="feedback" id="fb" aria-live="polite"></div>
    ${timed ? '' : `<button class="btn primary" id="btn" hidden>${tr('next')} ${icon('ArrowRight', 18)}</button>`}`;

  if (listen) {
    card.querySelector('#play').onclick = () => speak(text);
    card.querySelector('#slow').onclick = () => speak(text, 0.6);
    speak(text);
  }

  card.querySelector('#opts').onclick = e => {
    const b = e.target.closest('[data-id]');
    if (!b || answered) return;
    answered = true;
    const ok = b.dataset.id === q.tense.id;

    card.querySelectorAll('.option').forEach(o => {
      o.disabled = true;
      if (o.dataset.id === q.tense.id) o.classList.add('is-ok');
    });
    if (!ok) b.classList.add('is-bad');

    recordAnswer({ ok, tenseId: q.tense.id, key: q.key, card });
    refreshCombo(card);
    if (timed) return onAnswer(ok);

    if (listen) card.querySelector('#reveal').hidden = false;
    card.querySelector('#fb').innerHTML = `
      ${verdict(ok, ok ? '' : `${tr('answer')}: <b>${tenseName(q.tense)}</b>`)}
      <p class="muted small">${tr('formula')}: ${formula(q.tense, q.form, lang)}</p>`;
    const btn = card.querySelector('#btn');
    btn.hidden = false;
    btn.onclick = onNext;
    btn.focus();
  };
}

export { canSpeak };
