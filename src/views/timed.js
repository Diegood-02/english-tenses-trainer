import { state, commit } from '../core/store.js';
import { applyTimed } from '../core/progress.js';
import { poolKeys } from '../core/tenses.js';
import { pickKey } from '../core/srs.js';
import { tr } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { animate, celebrate } from '../ui/effects.js';
import { backLink, viewHead, optionShortcuts } from '../ui/components.js';
import { choiceQuestion, questionFromKey, pickForm } from '../ui/questions.js';
import { levelTenses, levelVerbs } from '../ui/level.js';

const DURATION = 60;

export default function timed(el) {
  let tick = null;
  let delay = null;
  let running = false;
  let score = 0;
  let total = 0;
  let lastKey = null;
  let stopShortcuts = null;

  function intro() {
    el.innerHTML = `
      ${backLink('#/practice', tr('nav_practice'))}
      ${viewHead(tr('nav_timed'), tr('timed_help'))}
      <section class="card center-card">
        <span class="big-icon">${icon('Timer', 40)}</span>
        <p class="muted">${tr('timed_best')}</p>
        <p class="big-number">${state.timedBest}</p>
        <button class="btn primary" id="start">${tr('timed_start')} ${icon('ArrowRight', 18)}</button>
      </section>`;
    el.querySelector('#start').onclick = start;
    el.querySelector('#start').focus();
  }

  function start() {
    score = 0;
    total = 0;
    running = true;
    const endsAt = Date.now() + DURATION * 1000;

    el.innerHTML = `
      ${backLink('#/practice', tr('nav_practice'))}
      <div class="timer"><span class="timer-bar" id="bar"></span></div>
      <div class="timer-meta">
        <span class="row">${icon('Timer', 18)} <b id="secs">${DURATION}</b>s</span>
        <span>${tr('timed_score')}: <b id="score">0</b></span>
      </div>
      <div class="card quiz" id="card"></div>`;

    const bar = el.querySelector('#bar');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.transition = `transform ${DURATION}s linear`;
      bar.style.transform = 'scaleX(0)';
    }));

    const secs = el.querySelector('#secs');
    tick = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      secs.textContent = left;
      secs.classList.toggle('low', left <= 10);
      if (left === 0) finish();
    }, 200);

    stopShortcuts = optionShortcuts(el.querySelector('#card'));
    next();
  }

  function next() {
    if (!running) return;
    const card = el.querySelector('#card');
    const key = pickKey(poolKeys('id', levelTenses(), levelVerbs()), state.cards, Date.now(), Math.random, lastKey);
    lastKey = key;
    choiceQuestion(card, questionFromKey(key, pickForm('mix')), {
      timed: true,
      onAnswer: ok => {
        total++;
        if (ok) score++;
        const scoreEl = el.querySelector('#score');
        scoreEl.textContent = score;
        animate(scoreEl, 'pop');
        delay = setTimeout(next, ok ? 350 : 900);
      },
    });
  }

  function stop() {
    running = false;
    clearInterval(tick);
    clearTimeout(delay);
    if (stopShortcuts) stopShortcuts();
    stopShortcuts = null;
  }

  function finish() {
    stop();
    const previous = state.timedBest;
    commit(applyTimed(state, score));
    const record = score > previous;
    if (record) celebrate();

    el.innerHTML = `
      ${backLink('#/practice', tr('nav_practice'))}
      ${viewHead(tr('time_up'))}
      <section class="card center-card">
        ${record ? `<p class="record">${icon('PartyPopper', 20)} ${tr('new_record')}</p>` : ''}
        <p class="muted">${tr('timed_score')}</p>
        <p class="big-number">${score}<span class="muted">/${total}</span></p>
        <p class="muted">${tr('timed_best')}: <b>${state.timedBest}</b></p>
        <button class="btn primary" id="again">${tr('timed_again')} ${icon('RotateCcw', 18)}</button>
      </section>`;
    el.querySelector('#again').onclick = start;
    el.querySelector('#again').focus();
  }

  intro();
  return stop;
}
