import { state, resetState } from '../core/store.js';
import { levelInfo } from '../core/progress.js';
import { masteredCount } from '../core/srs.js';
import { TENSES } from '../core/tenses.js';
import { tr, tenseName } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { fillBars } from '../ui/effects.js';

export default function progress(el) {
  function draw() {
    const totals = Object.values(state.tenses)
      .reduce((a, s) => ({ ok: a.ok + s.ok, total: a.total + s.total }), { ok: 0, total: 0 });
    const accuracy = totals.total ? Math.round((totals.ok / totals.total) * 100) : 0;
    const lv = levelInfo(state.xp);

    el.innerHTML = `
      <header class="view-head">
        <h1>${tr('nav_progress')}</h1>
        <p class="muted">${tr('progress_help')}</p>
      </header>

      <section class="tiles four">
        <div class="tile"><b>${totals.total}</b><span class="muted small">${tr('answers')}</span></div>
        <div class="tile"><b>${accuracy}%</b><span class="muted small">${tr('accuracy')}</span></div>
        <div class="tile"><b>${tr('rank')} ${lv.level}</b><span class="muted small">${state.xp} XP</span></div>
        <div class="tile"><b>${state.timedBest}</b><span class="muted small">${tr('nav_timed')}</span></div>
      </section>

      <section class="card table-card">
        <table class="progress-table">
          <thead><tr><th>${tr('col_tense')}</th><th>${tr('hits')}</th><th></th></tr></thead>
          <tbody>
            ${TENSES.map(t => {
              const s = state.tenses[t.id] || { ok: 0, total: 0 };
              const pct = s.total ? Math.round((s.ok / s.total) * 100) : 0;
              return `
                <tr>
                  <td>${tenseName(t)}</td>
                  <td class="num">${s.ok}/${s.total}</td>
                  <td class="bar-cell"><span class="bar"><span data-width="${pct}"></span></span></td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </section>

      <section class="card row-between">
        <span class="row">${icon('Trophy')} ${masteredCount(state.cards)} ${tr('mastered')}</span>
        <span class="row">${icon('Puzzle')}
          ${tr('hangman_won')}: <b>${state.hangman.won}</b> · ${tr('hangman_lost')}: <b>${state.hangman.lost}</b></span>
      </section>

      <button class="btn ghost" id="reset">${icon('RotateCcw', 16)} ${tr('reset')}</button>`;

    fillBars(el);
    el.querySelector('#reset').onclick = () => {
      if (confirm(tr('reset_confirm'))) {
        resetState();
        draw();
      }
    };
  }

  draw();
}
