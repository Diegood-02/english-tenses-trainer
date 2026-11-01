import '@fontsource-variable/inter';
import './styles/main.css';

import { tr, lang, setLang } from './i18n.js';
import { state, onChange } from './core/store.js';
import { currentStreak, dayKey, levelInfo } from './core/progress.js';
import { icon } from './ui/icons.js';
import { speak } from './ui/speech.js';
import { applyTheme, cycleTheme, theme, themeIcon } from './ui/theme.js';
import home from './views/home.js';
import explore from './views/explore.js';
import conjugate from './views/conjugate.js';
import identify from './views/identify.js';
import hangman from './views/hangman.js';
import progress from './views/progress.js';

const ROUTES = { home, verbs: explore, conjugate, identify, hangman, progress };
const NAV = [
  ['home', 'House'],
  ['verbs', 'BookOpen'],
  ['conjugate', 'PenLine'],
  ['identify', 'Target'],
  ['hangman', 'Puzzle'],
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
  const { level } = levelInfo(state.xp);
  $('#stats').innerHTML = `
    <span class="chip flame ${streak ? 'on' : ''}" title="${tr('streak')}">${icon('Flame', 16)} ${streak}</span>
    <span class="chip" title="${tr('level')}">${icon('Zap', 16)} ${tr('lvl')} ${level}</span>`;
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
  renderShell(name);

  const view = document.createElement('div');
  view.className = 'view';
  $('#view').replaceChildren(view);
  cleanup = ROUTES[name](view, param) || null;

  const key = `${name}/${param}`;
  if (key !== lastRoute) window.scrollTo({ top: 0 });
  lastRoute = key;
}

document.addEventListener('click', e => {
  const speaker = e.target.closest('[data-speak]');
  if (speaker) speak(speaker.dataset.speak);
});

$('#lang').onclick = () => {
  setLang(lang === 'es' ? 'en' : 'es');
  route();
};

$('#theme').onclick = () => {
  cycleTheme();
  renderShell(parseHash().name);
};

window.addEventListener('hashchange', route);
onChange(renderStats);

applyTheme();
route();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
}
