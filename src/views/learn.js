import { TENSES, formula } from '../core/tenses.js';
import { VERBS } from '../data/verbs.js';
import { tr, tenseName, lang } from '../i18n.js';
import { viewHead, linkCard } from '../ui/components.js';
import { levelBadge } from '../ui/level.js';

const GROUPS = ['pres', 'past', 'fut'];

export default function learn(el) {
  el.innerHTML = `
    ${viewHead(tr('nav_learn'), tr('learn_help'))}

    <section class="modes">
      ${linkCard({ href: '#/verbs', icon: 'BookOpen', title: tr('nav_verbs'), desc: tr('mode_verbs_desc', { n: VERBS.length }) })}
      ${linkCard({ href: '#/flashcards', icon: 'Layers', title: tr('nav_flashcards'), desc: tr('mode_flashcards_desc') })}
    </section>

    <h2 class="section-title">${tr('nav_theory')}</h2>
    ${GROUPS.map(group => `
      <h3 class="group-title">${tr(`group_${group}`)}</h3>
      <section class="tense-grid">
        ${TENSES.filter(t => t.time === group).map(t => `
          <a class="tense-card" href="#/theory/${t.id}">
            <span class="tense-card-top"><b>${tenseName(t)}</b>${levelBadge(t.level)}</span>
            <span class="muted small">${formula(t, 'aff', lang)}</span>
          </a>`).join('')}
      </section>`).join('')}`;
}
