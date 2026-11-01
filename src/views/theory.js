import { TENSES, TENSE_BY_ID, FORMS, formula, sentence } from '../core/tenses.js';
import { VERB_BY_BASE } from '../data/verbs.js';
import { THEORY } from '../data/theory.js';
import { tr, tenseName, lang } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { speakButton } from '../ui/speech.js';
import { backLink } from '../ui/components.js';
import { timeline } from '../ui/timeline.js';
import { levelBadge } from '../ui/level.js';

// Verbo modelo para la tabla de estructura: "She works from home."
const MODEL = VERB_BY_BASE.work;

export default function theory(el, param) {
  const t = TENSE_BY_ID[param] || TENSES[0];
  const index = TENSES.indexOf(t);
  const prev = TENSES[index - 1];
  const next = TENSES[index + 1];
  const other = lang === 'es' ? t.en : t.es;

  el.innerHTML = `
    ${backLink('#/learn', tr('nav_learn'))}
    <header class="view-head">
      <h1 class="row">${tenseName(t)} ${levelBadge(t.level)}</h1>
      <p class="muted">${other}</p>
    </header>

    <section class="card timeline-card">${timeline(t)}</section>

    <h2 class="section-title">${tr('when_use')}</h2>
    <section class="card list uses">
      ${THEORY[t.id].map(use => `
        <div class="use">
          <b>${use[lang]}</b>
          <p class="example">${use.ex} ${speakButton(use.ex)}</p>
        </div>`).join('')}
    </section>

    <h2 class="section-title">${tr('structure')}</h2>
    <section class="card table-card">
      <table>
        <thead><tr><th></th><th>${tr('formula')}</th><th>${tr('example')}</th><th></th></tr></thead>
        <tbody>
          ${FORMS.map(form => {
            const ex = sentence(t, MODEL, 'she', form, '');
            return `
              <tr>
                <td><b>${tr(`form_${form}`)}</b></td>
                <td class="muted">${formula(t, form, lang)}</td>
                <td>${ex}</td>
                <td>${speakButton(ex)}</td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </section>

    <h2 class="section-title">${tr('keywords')}</h2>
    <div class="keyword-list">${t.markers.map(m => `<span class="keyword">${m}</span>`).join('')}</div>

    <a class="btn primary wide" href="#/conjugate/${t.id}">${tr('practice_tense')} ${icon('ArrowRight', 18)}</a>

    <nav class="pager">
      ${prev ? `<a href="#/theory/${prev.id}">${icon('ArrowLeft', 16)} ${tenseName(prev)}</a>` : '<span></span>'}
      ${next ? `<a href="#/theory/${next.id}">${tenseName(next)} ${icon('ArrowRight', 16)}</a>` : '<span></span>'}
    </nav>`;
}
