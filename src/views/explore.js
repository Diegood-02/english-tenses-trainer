import { VERBS, VERB_BY_BASE } from '../data/verbs.js';
import { TENSES } from '../core/tenses.js';
import { tr, tenseName, lang } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speakButton } from '../ui/speech.js';

const FILTERS = ['all', 'irregular', 'regular'];

export default function explore(el, param) {
  if (VERB_BY_BASE[param]) return detail(el, VERB_BY_BASE[param]);

  let filter = 'all';
  let query = '';

  el.innerHTML = `
    <header class="view-head">
      <h1>${tr('nav_verbs')}</h1>
      <p class="muted">${tr('mode_verbs_desc')}</p>
    </header>
    <label class="search">
      ${icon('Search', 18)}
      <input id="q" type="search" placeholder="${tr('search')}" aria-label="${tr('search')}">
    </label>
    <div class="chips" id="chips"></div>
    <div class="verb-grid" id="grid"></div>`;

  const grid = el.querySelector('#grid');
  const chips = el.querySelector('#chips');

  function draw() {
    chips.innerHTML = FILTERS
      .map(f => `<button class="chip-btn ${f === filter ? 'active' : ''}" data-filter="${f}">${tr(f)}</button>`).join('');
    const q = query.toLowerCase();
    const list = VERBS.filter(v =>
      (filter === 'all' || (filter === 'irregular') === v.irregular)
      && [v.base, v.past, v.pp, v.es].some(f => f.toLowerCase().includes(q)));
    grid.innerHTML = list.length
      ? list.map(v => `
          <a class="verb-card" href="#/verbs/${v.base}">
            <b>${v.base}</b>
            <span class="forms">${v.past} · ${v.pp}</span>
            <span class="muted small">${v.es}</span>
          </a>`).join('')
      : `<p class="muted empty">${tr('no_results')}</p>`;
  }

  el.querySelector('#q').oninput = e => {
    query = e.target.value.trim();
    draw();
  };
  chips.onclick = e => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    draw();
  };

  draw();
}

function detail(el, v) {
  const forms = [['form_base', v.base], ['form_past', v.past], ['form_pp', v.pp], ['form_ing', v.ing]];

  el.innerHTML = `
    <a class="back" href="#/verbs">${icon('ArrowLeft', 18)} ${tr('back')}</a>
    <section class="card verb-hero">
      <div class="verb-title">
        <h1>${v.base}</h1>
        ${speakButton(v.base)}
      </div>
      <p class="muted">${v.es} · ${tr(v.irregular ? 'irregular_one' : 'regular_one')}</p>
      <div class="forms-row">
        ${forms.map(([label, form]) => `
          <div class="form-box">
            <span class="muted small">${tr(label)}</span>
            <b>${form}</b>
            ${speakButton(form)}
          </div>`).join('')}
      </div>
    </section>
    <section class="card table-card">
      <table class="tense-table">
        <thead>
          <tr><th>${tr('col_tense')}</th><th>${tr('formula')}</th><th>I</th><th>she</th><th></th></tr>
        </thead>
        <tbody>
          ${TENSES.map(t => `
            <tr>
              <td>${tenseName(t)}</td>
              <td class="muted">${t.formula[lang]}</td>
              <td>I ${t.phrase(v, 'I')}</td>
              <td>she ${t.phrase(v, 'she')}</td>
              <td>${speakButton(`She ${t.phrase(v, 'she')}`)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </section>`;
}
