import '@fontsource-variable/inter';
import './styles/main.css';

import { tr, lang, setLang } from './i18n.js';
import { state, onChange } from './core/store.js';
import { currentStreak, dayKey, levelInfo } from './core/progress.js';
import { icon } from './ui/icons.js';
import { speak } from './ui/speech.js';
import { applyTheme, cycleTheme, theme, themeIcon } from './ui/theme.js';
import { level, setLevel } from './ui/level.js';
import home from './views/home.js';
import learn from './views/learn.js';
import theory from './views/theory.js';
import explore from './views/explore.js';
import flashcards from './views/flashcards.js';
import practiceHub from './views/practice-hub.js';
import conjugate from './views/conjugate.js';
import { identify, listening } from './views/identify.js';
import writing from './views/writing.js';
import timed from './views/timed.js';
import review from './views/review.js';
import hangman from './views/hangman.js';
import progress from './views/progress.js';

// Cada ruta pertenece a una pestaña de la navegación
const ROUTES = {
  home: [home, 'home'],
  learn: [learn, 'learn'],
  theory: [theory, 'learn'],
  verbs: [explore, 'learn'],
  flashcards: [flashcards, 'learn'],
  practice: [practiceHub, 'practice'],
  conjugate: [conjugate, 'practice'],
  identify: [identify, 'practice'],
  listening: [listening, 'practice'],
  writing: [writing, 'practice'],
  timed: [timed, 'practice'],
  review: [review, 'practice'],
  hangman: [hangman, 'practice'],
  progress: [progress, 'progress'],
};
const NAV = [
  ['home', 'House'],
  ['learn', 'GraduationCap'],
  ['practice', 'Dumbbell'],
  ['progress', 'ChartColumn'],
];

const $ = sel => document.querySelector(sel);
let cleanup = null;
let lastRoute = null;

// Rutas con hash (#/verbs/write) para que recargar y "atrás" funcionen en GitHub Pages
function parseHash() {
  const [name, param] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: ROUTES[name] ? name : 'home', param: param ? decodeURIComponent(param) : null };
}

function renderStats() {
  const streak = currentStreak(state.streak, dayKey(new Date()));
  const { level: rank } = levelInfo(state.xp);
  $('#stats').innerHTML = `
    <span class="chip flame ${streak ? 'on' : ''}" title="${tr('streak')}">${icon('Flame', 16)} ${streak}</span>
    <span class="chip" title="${tr('rank')}">${icon('Zap', 16)} ${rank}</span>
    <a class="chip level-chip" href="#/practice" title="${tr('cefr')}">${level}</a>`;
}

function renderShell(active) {
  document.documentElement.lang = lang;
  $('#nav').innerHTML = NAV.map(([name, ic]) => `
    <a href="#/${name}" class="tab ${name === active ? 'active' : ''}" ${name === active ? 'aria-current="page"' : ''}>
      ${icon(ic)}<span>${tr(`nav_${name}`)}</span>
    </a>`).join('');
  $('#lang').textContent = lang === 'es' ? 'EN' : 'ES';
  $('#lang').title = tr('lang_switch');
  $('#theme').innerHTML = icon(themeIcon());
  $('#theme').title = tr(`theme_${theme}`);
  $('#theme').setAttribute('aria-label', tr(`theme_${theme}`));
  renderStats();
}

function route() {
  if (cleanup) cleanup();
  const { name, param } = parseHash();
  const [render, tab] = ROUTES[name];
  renderShell(tab);

  const view = document.createElement('div');
  view.className = 'view';
  $('#view').replaceChildren(view);
  cleanup = render(view, param) || null;

  const key = `${name}/${param}`;
  if (key !== lastRoute) window.scrollTo({ top: 0 });
  lastRoute = key;
}

document.addEventListener('click', e => {
  const speaker = e.target.closest('[data-speak]');
  if (speaker) return speak(speaker.dataset.speak);
  const levelBtn = e.target.closest('[data-level]');
  if (levelBtn) {
    setLevel(levelBtn.dataset.level);
    route();
  }
});

$('#lang').onclick = () => {
  setLang(lang === 'es' ? 'en' : 'es');
  route();
};

$('#theme').onclick = () => {
  cycleTheme();
  renderShell(ROUTES[parseHash().name][1]);
};

window.addEventListener('hashchange', route);
onChange(renderStats);

applyTheme();
route();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
}
