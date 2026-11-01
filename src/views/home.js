import { state } from '../core/store.js';
import {
  currentStreak, dailyCount, dayKey, levelInfo, weakTenses, DAILY_GOAL,
} from '../core/progress.js';
import { dueCount, masteredCount } from '../core/srs.js';
import { TENSE_BY_ID } from '../core/tenses.js';
import { tr, tenseName } from '../i18n.js';
import { icon } from '../ui/icons.js';
import { fillBars } from '../ui/effects.js';
import { linkCard } from '../ui/components.js';
import { levelPicker } from '../ui/level.js';
import { reviewKeys } from './review.js';

export default function home(el) {
  const now = Date.now();
  const today = dayKey(new Date(now));
  const streak = currentStreak(state.streak, today);
  const rank = levelInfo(state.xp);
  const daily = dailyCount(state, today);
  const due = dueCount(state.cards, now);
  const errors = reviewKeys().length;
  const weak = weakTenses(state.tenses, 3).filter(w => TENSE_BY_ID[w.id]);
  const goalPct = Math.min(daily / DAILY_GOAL, 1) * 100;

  el.innerHTML = `
    <section class="card hero">
      <div class="hero-text">
        <p class="eyebrow">${tr('home_eyebrow')}</p>
        <h1>${streak ? tr('home_title_streak', { n: streak }) : tr('home_title')}</h1>
        <p class="muted">${due ? tr('home_due', { n: due }) : tr('home_nodue')}</p>
        <div class="hero-actions">
          <a class="btn primary" href="#/conjugate">${tr('start')} ${icon('ArrowRight', 18)}</a>
          ${errors ? `<a class="btn" href="#/review">${icon('History', 18)} ${tr('review_errors', { n: errors })}</a>` : ''}
        </div>
      </div>
      <div class="ring" role="img" aria-label="${tr('daily_goal')}: ${daily}/${DAILY_GOAL}">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle class="ring-track" cx="20" cy="20" r="17" />
          ${goalPct ? `<circle class="ring-fill" cx="20" cy="20" r="17" pathLength="100" data-offset="${100 - goalPct}" />` : ''}
        </svg>
        <div class="ring-label">
          <b>${daily}<span>/${DAILY_GOAL}</span></b>
          <small>${tr('daily_goal')}</small>
        </div>
      </div>
    </section>

    <section class="card level-card">
      <div>
        <b>${tr('cefr')}</b>
        <p class="muted small">${tr('level_help')}</p>
      </div>
      ${levelPicker()}
    </section>

    <section class="tiles">
      <div class="tile">
        <span class="tile-icon flame">${icon('Flame')}</span>
        <b>${streak}</b>
        <span class="muted small">${tr('streak_days')}</span>
      </div>
      <div class="tile">
        <span class="tile-icon">${icon('Zap')}</span>
        <b>${tr('rank')} ${rank.level}</b>
        <span class="bar"><span data-width="${Math.round((rank.into / rank.span) * 100)}"></span></span>
        <span class="muted small">${tr('xp_to_next', { n: rank.span - rank.into })}</span>
      </div>
      <div class="tile">
        <span class="tile-icon ok">${icon('Trophy')}</span>
        <b>${masteredCount(state.cards)}</b>
        <span class="muted small">${tr('mastered')}</span>
      </div>
    </section>

    <h2 class="section-title">${tr('modes')}</h2>
    <section class="modes">
      ${linkCard({ href: '#/conjugate', icon: 'PenLine', title: tr('nav_conjugate'), desc: tr('mode_conjugate_desc') })}
      ${linkCard({ href: '#/listening', icon: 'Headphones', title: tr('nav_listening'), desc: tr('mode_listening_desc') })}
      ${linkCard({ href: '#/writing', icon: 'NotebookPen', title: tr('nav_writing'), desc: tr('mode_writing_desc') })}
      ${linkCard({ href: '#/timed', icon: 'Timer', title: tr('nav_timed'), desc: tr('mode_timed_desc') })}
    </section>

    ${weak.length ? `
      <h2 class="section-title">${tr('weak')}</h2>
      <section class="card list">
        ${weak.map(w => `
          <a class="weak-row" href="#/theory/${w.id}">
            <span>${tenseName(TENSE_BY_ID[w.id])}</span>
            <span class="bar"><span data-width="${w.pct}"></span></span>
            <span class="muted small num">${w.pct}%</span>
          </a>`).join('')}
      </section>` : ''}`;

  fillBars(el);
}
