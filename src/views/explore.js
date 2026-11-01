import { VERBS, VERB_BY_BASE } from '../data/verbs.js';
import { TENSES, FORMS, formula, verbPhrase, clause, supports } from '../core/tenses.js';
import { tr, tenseName, lang } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speakButton } from '../ui/speech.js';
import { backLink, viewHead, chipRow } from '../ui/components.js';
import { levelBadge } from '../ui/level.js';

const FILTERS = ['all', 'irregular', 'regular'];

export default function explore(el, param) {
  if (VERB_BY_BASE[param]) return detail(el, VERB_BY_BASE[param]);

  let filter = 'all';
  let query = '';

  el.innerHTML = `
    ${backLink('#/learn', tr('nav_learn'))}
    ${viewHead(tr('nav_verbs'), tr('mode_verbs_desc', { n: VERBS.length }))}
    <label class="search">
      ${icon('Search', 18)}
      <input id="q" type="search" placeholder="${tr('search')}" aria-label="${tr('search')}">
    </label>
    <div class="chips" id="chips"></div>
    <div class="verb-grid" id="grid"></div>`;

  const grid = el.querySelector('#grid');
  const chips = el.querySelector('#chips');

  function draw() {
    chips.innerHTML = chipRow(FILTERS.map(f => [f, tr(f)]), filter, 'filter');
    const q = query.toLowerCase();
    const list = VERBS.filter(v =>
      (filter === 'all' || (filter === 'irregular') === v.irregular)
      && [v.base, v.past, v.pp, v.es].some(f => f.toLowerCase().includes(q)));
    grid.innerHTML = list.length
      ? list.map(v => `
          <a class="verb-card" href="#/verbs/${v.base}">
            <span class="verb-card-top"><b>${v.base}</b>${levelBadge(v.level)}</span>
            <span class="forms">${v.pastLabel} · ${v.pp}</span>
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
  const forms = [['form_base', v.base], ['form_past', v.pastLabel], ['form_pp', v.pp], ['form_ing', v.ing]];
  let form = 'aff';

  el.innerHTML = `
    ${backLink('#/verbs', tr('nav_verbs'))}
    <section class="card verb-hero">
      <div class="verb-title">
        <h1>${v.base}</h1>
        ${speakButton(v.base)}
        ${levelBadge(v.level)}
      </div>
      <p class="muted">${v.es} · ${tr(v.irregular ? 'irregular_one' : 'regular_one')}</p>
      <div class="forms-row">
        ${forms.map(([label, f]) => `
          <div class="form-box">
            <span class="muted small">${tr(label)}</span>
            <b>${f}</b>
            ${speakButton(f)}
          </div>`).join('')}
      </div>
    </section>
    <div class="chips" id="forms"></div>
    <section class="card table-card">
      <table class="tense-table">
        <thead><tr><th>${tr('col_tense')}</th><th>${tr('formula')}</th><th>I</th><th>she</th><th></th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </section>`;

  const chips = el.querySelector('#forms');
  const rows = el.querySelector('#rows');

  // Pregunta: "Has she written?"; afirmativa y negativa: "she has (not) written"
  const cell = (t, s) => (form === 'q' ? `${clause(t, v, s, 'q')}?` : `${s} ${verbPhrase(t, v, s, form)}`);

  function draw() {
    chips.innerHTML = chipRow(FORMS.map(f => [f, tr(`form_${f}`)]), form, 'form');
    rows.innerHTML = TENSES.map(t => {
      if (!supports(v, t)) {
        return `<tr><td><a href="#/theory/${t.id}">${tenseName(t)}</a></td><td class="muted">${formula(t, form, lang)}</td><td class="muted">—</td><td class="muted">—</td><td></td></tr>`;
      }
      const she = cell(t, 'she');
      return `
        <tr>
          <td><a href="#/theory/${t.id}">${tenseName(t)}</a></td>
          <td class="muted">${formula(t, form, lang)}</td>
          <td>${cell(t, 'I')}</td>
          <td>${she}</td>
          <td>${speakButton(she.charAt(0).toUpperCase() + she.slice(1))}</td>
        </tr>`;
    }).join('');
  }

  chips.onclick = e => {
    const b = e.target.closest('[data-form]');
    if (!b) return;
    form = b.dataset.form;
    draw();
  };

  draw();
}
