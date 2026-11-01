import { SUBJECTS, sentence, supports } from '../core/tenses.js';
import { isCorrect } from '../core/answers.js';
import { XP } from '../core/progress.js';
import { rand, shuffle, esc } from '../core/util.js';
import { tr, tenseName } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speak, canSpeak, speakButton } from '../ui/speech.js';
import { backLink, viewHead, chipRow } from '../ui/components.js';
import { recordAnswer, comboBadge, refreshCombo } from '../ui/practice.js';
import { pickForm } from '../ui/questions.js';
import { levelTenses, levelVerbs } from '../ui/level.js';

// Oración aleatoria del nivel; la palabra "I" se mantiene en mayúscula
function randomSentence() {
  const verbs = levelVerbs();
  let v;
  let tense;
  do {
    v = rand(verbs);
    tense = rand(levelTenses());
  } while (!supports(v, tense));
  const form = pickForm('mix');
  return { v, tense, form, text: sentence(tense, v, rand(SUBJECTS), form, rand(tense.markers)) };
}

const tokenize = text => text.replace(/[.?]$/, '').split(' ');
const lower = w => (w === 'I' ? w : w.toLowerCase());

export default function writing(el) {
  let mode = 'order';

  el.innerHTML = `
    ${backLink('#/practice', tr('nav_practice'))}
    ${viewHead(tr('nav_writing'), tr('writing_help'))}
    <div class="chips" id="modes"></div>
    <div class="card quiz" id="card"></div>`;

  const modes = el.querySelector('#modes');
  const card = el.querySelector('#card');

  function drawModes() {
    const items = [['order', tr('order')]];
    if (canSpeak) items.push(['dictation', tr('dictation')]);
    modes.innerHTML = chipRow(items, mode, 'mode');
  }

  modes.onclick = e => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    mode = b.dataset.mode;
    drawModes();
    next();
  };

  const next = () => (mode === 'order' ? orderQuestion() : dictationQuestion());

  const header = q => `
    <div class="quiz-top">
      <span class="pills"><span class="pill">${tenseName(q.tense)}</span></span>
      ${comboBadge()}
    </div>`;

  function finish(q, ok, extraXp) {
    card.querySelector('#fb').innerHTML = `
      <p class="${ok ? 'ok' : 'bad'} verdict">${icon(ok ? 'Check' : 'X', 18)} ${ok ? tr('correct') : tr('wrong')}</p>
      <p class="full">${esc(q.text)} ${speakButton(q.text)}</p>`;
    recordAnswer({ ok, tenseId: q.tense.id, key: `${mode === 'order' ? 'ord' : 'dic'}|${q.v.base}|${q.tense.id}`, card, xp: extraXp });
    refreshCombo(card);
  }

  // ---------- Ordenar palabras ----------
  function orderQuestion() {
    const q = randomSentence();
    const target = tokenize(q.text).map(lower);
    let tiles = shuffle(target.map((w, i) => ({ w, i })));
    // Evita que salga ya ordenada
    if (tiles.every((t, i) => t.w === target[i]) && tiles.length > 1) tiles = [...tiles.slice(1), tiles[0]];
    const picked = [];
    let answered = false;

    card.innerHTML = `
      ${header(q)}
      <p class="muted">${tr('order_help')}</p>
      <div class="built" id="built" aria-live="polite"></div>
      <div class="tiles-pool" id="pool">
        ${tiles.map(t => `<button type="button" class="tile-word" data-i="${t.i}">${esc(t.w)}</button>`).join('')}
      </div>
      <div class="row-actions">
        <button type="button" class="btn" id="clear">${icon('Eraser', 16)} ${tr('clear')}</button>
        <button type="button" class="btn primary" id="btn">${tr('check')}</button>
      </div>
      <div class="feedback" id="fb" aria-live="polite"></div>`;

    const built = card.querySelector('#built');
    const pool = card.querySelector('#pool');
    const btn = card.querySelector('#btn');

    // picked guarda la posición original de cada ficha elegida
    const drawBuilt = () => {
      built.innerHTML = picked
        .map((i, n) => `<button type="button" class="tile-word placed" data-n="${n}">${esc(target[i])}</button>`)
        .join('');
    };

    pool.onclick = e => {
      const b = e.target.closest('[data-i]');
      if (!b || answered) return;
      picked.push(Number(b.dataset.i));
      b.disabled = true;
      drawBuilt();
    };
    built.onclick = e => {
      const b = e.target.closest('[data-n]');
      if (!b || answered) return;
      const [i] = picked.splice(Number(b.dataset.n), 1);
      pool.querySelector(`[data-i="${i}"]`).disabled = false;
      drawBuilt();
    };
    card.querySelector('#clear').onclick = () => {
      if (answered) return;
      picked.length = 0;
      pool.querySelectorAll('[data-i]').forEach(b => { b.disabled = false; });
      drawBuilt();
    };
    btn.onclick = () => {
      if (answered) return next();
      if (!picked.length) return;
      answered = true;
      // Se comparan palabras, así da igual cuál de dos fichas iguales ("the") se eligió
      const attempt = picked.map(i => target[i]).join(' ');
      const ok = attempt === target.join(' ');
      built.classList.add(ok ? 'is-ok' : 'is-bad');
      finish(q, ok, XP.correct);
      btn.textContent = tr('next');
      btn.focus();
    };
  }

  // ---------- Dictado ----------
  function dictationQuestion() {
    const q = randomSentence();
    let answered = false;

    card.innerHTML = `
      ${header(q)}
      <p class="muted">${tr('dictation_help')}</p>
      <div class="listen-box">
        <button type="button" class="btn primary play" id="play">${icon('Volume2', 20)} ${tr('listen_play')}</button>
        <button type="button" class="btn" id="slow">${icon('Snail', 18)} ${tr('listen_slow')}</button>
      </div>
      <form class="answer" id="form" autocomplete="off">
        <input id="ans" autocapitalize="off" autocorrect="off" spellcheck="false"
          placeholder="${tr('type_sentence')}" aria-label="${tr('type_sentence')}">
        <button class="btn primary" id="btn">${tr('check')}</button>
      </form>
      <div class="feedback" id="fb" aria-live="polite"></div>`;

    const input = card.querySelector('#ans');
    card.querySelector('#play').onclick = () => { speak(q.text); input.focus(); };
    card.querySelector('#slow').onclick = () => { speak(q.text, 0.6); input.focus(); };
    card.querySelector('#form').onsubmit = e => {
      e.preventDefault();
      if (answered) return next();
      if (!input.value.trim()) return input.focus();
      answered = true;
      const ok = isCorrect(input.value, q.text);
      input.readOnly = true;
      input.classList.add(ok ? 'is-ok' : 'is-bad');
      finish(q, ok, XP.dictation);
      const btn = card.querySelector('#btn');
      btn.textContent = tr('next');
      btn.focus();
    };
    speak(q.text);
    input.focus();
  }

  drawModes();
  next();
}
