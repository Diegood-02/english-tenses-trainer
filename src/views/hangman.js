import { VERBS } from '../data/verbs.js';
import { rand } from '../core/util.js';
import { tr } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speakButton } from '../ui/speech.js';
import { animate } from '../ui/effects.js';
import { recordHangmanResult } from '../ui/practice.js';

const FORMS = ['base', 'past', 'pp'];
const LIVES = 6;
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export default function hangman(el) {
  let game = null;

  el.innerHTML = `
    <header class="view-head">
      <h1>${tr('nav_hangman')}</h1>
      <p class="muted">${tr('hangman_help')}</p>
    </header>
    <div class="card quiz hangman" id="card">
      <div class="hang-layout">
        <svg class="gallows" viewBox="0 0 120 140" aria-hidden="true">
          <path class="frame" d="M10 132 H74 M30 132 V8 H82 V24" />
          <circle class="part" cx="82" cy="36" r="12" pathLength="1" />
          <path class="part" d="M82 48 V86" pathLength="1" />
          <path class="part" d="M82 58 L66 74" pathLength="1" />
          <path class="part" d="M82 58 L98 74" pathLength="1" />
          <path class="part" d="M82 86 L68 110" pathLength="1" />
          <path class="part" d="M82 86 L96 110" pathLength="1" />
        </svg>
        <div class="hang-main">
          <span class="pill" id="hint"></span>
          <div class="letters" id="word"></div>
          <p class="lives" id="lives"></p>
        </div>
      </div>
      <div class="keys" id="keys"></div>
      <div class="feedback" id="fb" aria-live="polite"></div>
      <button class="btn primary" id="btn" hidden>${tr('new_word')} ${icon('RotateCcw', 18)}</button>
    </div>`;

  const $ = sel => el.querySelector(sel);
  const card = $('#card');

  function newGame() {
    const v = rand(VERBS);
    const form = rand(FORMS);
    const word = v[form];
    // Se muestra ~40% de las letras (nunca la primera); el resto hay que adivinarlo
    const slots = [...word].map((c, i) => (i > 0 && Math.random() < 0.4 ? c : null));
    if (!slots.includes(null)) slots[slots.length - 1] = null;
    game = { v, word, slots, guessed: new Set(), misses: 0, over: false };

    $('#hint').textContent = `${v.es} · ${tr(`form_${form}`)}`;
    $('#word').innerHTML = slots
      .map(c => `<span class="letter ${c ? 'shown' : ''}">${c ?? ''}</span>`).join('');
    $('#keys').innerHTML = [...LETTERS]
      .map(c => `<button class="key" data-key="${c}" aria-label="${c}">${c}</button>`).join('');
    el.querySelectorAll('.part').forEach(p => p.classList.remove('on'));
    $('#fb').innerHTML = '';
    $('#btn').hidden = true;
    drawLives();
  }

  function drawLives() {
    const left = LIVES - game.misses;
    $('#lives').innerHTML = `<span class="sr-only">${tr('lives')}: ${left}</span>`
      + Array.from({ length: LIVES }, (_, i) => `<span class="heart ${i < left ? 'on' : ''}">${icon('Heart', 16)}</span>`).join('');
  }

  function reveal(i, c, missed = false) {
    const tile = $('#word').children[i];
    tile.textContent = c;
    tile.classList.add('shown', 'flip');
    if (missed) tile.classList.add('missed');
  }

  function guess(letter) {
    if (!game || game.over || game.guessed.has(letter)) return;
    game.guessed.add(letter);
    const key = $(`[data-key="${letter}"]`);
    const hit = game.word.includes(letter);
    key.disabled = true;
    key.classList.add(hit ? 'hit' : 'miss');

    if (hit) {
      [...game.word].forEach((c, i) => {
        if (c === letter && !game.slots[i]) {
          game.slots[i] = c;
          reveal(i, c);
        }
      });
    } else {
      game.misses++;
      el.querySelectorAll('.part')[game.misses - 1].classList.add('on');
      animate($('#word'), 'shake');
      drawLives();
    }

    if (!game.slots.includes(null)) finish(true);
    else if (game.misses >= LIVES) finish(false);
  }

  function finish(won) {
    game.over = true;
    if (!won) game.slots.forEach((c, i) => { if (!c) reveal(i, game.word[i], true); });
    el.querySelectorAll('.key').forEach(k => { k.disabled = true; });
    const { v } = game;
    $('#fb').innerHTML = `
      <p class="${won ? 'ok' : 'bad'} verdict">${icon(won ? 'Check' : 'X', 18)} ${won ? tr('won') : tr('lost')}</p>
      <p class="full">${game.word} ${speakButton(game.word)}
        <span class="muted small">${v.base} · ${v.past} · ${v.pp}</span></p>`;
    $('#btn').hidden = false;
    $('#btn').focus();
    recordHangmanResult(won, card);
  }

  $('#keys').onclick = e => {
    const k = e.target.closest('[data-key]');
    if (k) guess(k.dataset.key);
  };
  $('#btn').onclick = newGame;

  const onKey = e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[a-z]$/i.test(e.key)) guess(e.key.toLowerCase());
  };
  document.addEventListener('keydown', onKey);

  newGame();
  return () => document.removeEventListener('keydown', onKey);
}
