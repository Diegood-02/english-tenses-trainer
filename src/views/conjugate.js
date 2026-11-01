import { state } from '../core/store.js';
import { TENSE_BY_ID, poolKeys } from '../core/tenses.js';
import { pickKey } from '../core/srs.js';
import { tr, tenseName } from '../i18n.js';
import { backLink, viewHead, chipRow } from '../ui/components.js';
import { conjQuestion, questionFromKey, pickForm } from '../ui/questions.js';
import { levelTenses, levelVerbs } from '../ui/level.js';

const FORM_SETTINGS = ['aff', 'neg', 'q', 'mix'];

export default function conjugate(el, param) {
  let tenseFilter = TENSE_BY_ID[param] ? param : 'all';
  let formSetting = 'aff';
  let lastKey = null;

  el.innerHTML = `
    ${backLink('#/practice', tr('nav_practice'))}
    ${viewHead(tr('nav_conjugate'), tr('conj_help'))}
    <div class="chips" id="forms"></div>
    <div class="chips" id="tenses"></div>
    <div class="card quiz" id="card"></div>`;

  const forms = el.querySelector('#forms');
  const tenses = el.querySelector('#tenses');
  const card = el.querySelector('#card');

  // Los tiempos de tu nivel; si llegas desde la teoría de uno superior, también se muestra
  const available = () => {
    const list = levelTenses();
    return tenseFilter !== 'all' && !list.includes(TENSE_BY_ID[tenseFilter])
      ? [...list, TENSE_BY_ID[tenseFilter]]
      : list;
  };

  function drawChips() {
    forms.innerHTML = chipRow(FORM_SETTINGS.map(f => [f, tr(`form_${f}`)]), formSetting, 'form');
    tenses.innerHTML = chipRow([['all', tr('all')], ...available().map(t => [t.id, tenseName(t)])], tenseFilter, 'tense');
  }

  forms.onclick = e => {
    const b = e.target.closest('[data-form]');
    if (!b) return;
    formSetting = b.dataset.form;
    drawChips();
    next();
  };
  tenses.onclick = e => {
    const b = e.target.closest('[data-tense]');
    if (!b) return;
    tenseFilter = b.dataset.tense;
    drawChips();
    next();
  };

  function next() {
    const list = tenseFilter === 'all' ? levelTenses() : [TENSE_BY_ID[tenseFilter]];
    const key = pickKey(poolKeys('conj', list, levelVerbs()), state.cards, Date.now(), Math.random, lastKey);
    lastKey = key;
    conjQuestion(card, questionFromKey(key, pickForm(formSetting)), { onNext: next });
  }

  drawChips();
  next();
}
