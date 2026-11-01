import { state } from '../core/store.js';
import { tr } from '../i18n.js';
import { viewHead, linkCard } from '../ui/components.js';
import { levelPicker } from '../ui/level.js';
import { reviewKeys } from './review.js';

export default function practiceHub(el) {
  const errors = reviewKeys().length;

  el.innerHTML = `
    ${viewHead(tr('nav_practice'), tr('practice_help'))}
    <section class="card level-card">
      <div>
        <b>${tr('cefr')}</b>
        <p class="muted small">${tr('level_help')}</p>
      </div>
      ${levelPicker()}
    </section>

    <section class="modes">
      ${linkCard({ href: '#/conjugate', icon: 'PenLine', title: tr('nav_conjugate'), desc: tr('mode_conjugate_desc') })}
      ${linkCard({ href: '#/identify', icon: 'Target', title: tr('nav_identify'), desc: tr('mode_identify_desc') })}
      ${linkCard({ href: '#/listening', icon: 'Headphones', title: tr('nav_listening'), desc: tr('mode_listening_desc') })}
      ${linkCard({ href: '#/writing', icon: 'NotebookPen', title: tr('nav_writing'), desc: tr('mode_writing_desc') })}
      ${linkCard({ href: '#/timed', icon: 'Timer', title: tr('nav_timed'), desc: tr('mode_timed_desc'), aside: state.timedBest ? `${tr('timed_best')}: ${state.timedBest}` : '' })}
      ${linkCard({ href: '#/review', icon: 'History', title: tr('nav_review'), desc: tr('mode_review_desc'), aside: errors ? `<span class="count">${errors}</span>` : '' })}
      ${linkCard({ href: '#/hangman', icon: 'Puzzle', title: tr('nav_hangman'), desc: tr('mode_hangman_desc') })}
    </section>`;
}
