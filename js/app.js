const $ = sel => document.querySelector(sel);
const view = $('#view');

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const normalize = s => s.trim().toLowerCase().replace(/\s+/g, ' ');

const VIEWS = {
  explore: renderExplore,
  conjugate: renderConjugate,
  identify: renderIdentify,
  hangman: renderHangman,
  progress: renderProgress,
};

let current = 'explore';
let answered = false;
let cur = null;
let onKey = null;

function renderChrome() {
  document.documentElement.lang = lang;
  $('#nav').innerHTML = Object.keys(VIEWS)
    .map(v => `<button data-view="${v}">${tr('nav_' + v)}</button>`).join('');
  document.querySelectorAll('[data-lang]')
    .forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
}

function render() {
  onKey = null;
  answered = false;
  renderChrome();
  document.querySelectorAll('[data-view]')
    .forEach(b => b.classList.toggle('active', b.dataset.view === current));
  VIEWS[current]();
}

function go(view) {
  current = view;
  render();
}

document.addEventListener('click', e => {
  const v = e.target.closest('[data-view]');
  if (v) return go(v.dataset.view);
  const l = e.target.closest('[data-lang]');
  if (l) {
    setLang(l.dataset.lang);
    render();
  }
});

document.addEventListener('keydown', e => {
  if (onKey) onKey(e);
});

// Feedback común para los modos de respuesta
function feedback(ok, answer) {
  $('#fb').innerHTML = `<span class="${ok ? 'ok' : 'bad'}">${ok ? tr('correct') : tr('wrong')}</span>`
    + (ok ? '' : ` ${tr('answer')}: <b>${answer}</b>`);
  $('#btn').textContent = tr('next');
  $('#btn').classList.remove('hidden');
  $('#btn').focus();
}

// ---------- Verbos: explorar todos los verbos y sus tiempos ----------

function renderExplore() {
  view.innerHTML = `
    <input id="search" class="search" placeholder="${tr('search')}" autocomplete="off">
    <ul class="verb-list" id="list"></ul>
    <section id="detail"></section>`;

  const list = $('#list');
  const draw = q => {
    const term = q.toLowerCase();
    list.innerHTML = VERBS
      .filter(v => (v.base + ' ' + v.es).includes(term))
      .map(v => `<li data-verb="${v.base}"><b>${v.base}</b>
        <span class="forms">${v.past} · ${v.pp}</span> <i>${v.es}</i></li>`).join('');
  };
  draw('');
  $('#search').oninput = e => draw(e.target.value.trim());
  list.onclick = e => {
    const li = e.target.closest('[data-verb]');
    if (li) showDetail(VERBS.find(v => v.base === li.dataset.verb));
  };
}

function showDetail(v) {
  $('#detail').innerHTML = `
    <h2>${v.base} <small>${v.past} · ${v.pp} · ${v.ing}</small></h2>
    <p class="meta">${v.es}</p>
    <div class="table-wrap">
      <table>
        <tr><th>${tr('col_tense')}</th><th>${tr('formula')}</th><th>I</th><th>she</th></tr>
        ${TENSES.map(x => `
          <tr>
            <td>${tenseName(x)}</td>
            <td class="formula">${x.formula[lang]}</td>
            <td>I ${x.phrase(v, 'I')}</td>
            <td>she ${x.phrase(v, 'she')}</td>
          </tr>`).join('')}
      </table>
    </div>`;
}

// ---------- Conjugar: escribir la forma correcta ----------

function pickTense(value) {
  return value === 'all' ? rand(TENSES) : TENSES.find(x => x.id === value);
}

function renderConjugate() {
  view.innerHTML = `
    <select id="tense">
      <option value="all">${tr('all_tenses')}</option>
      ${TENSES.map(x => `<option value="${x.id}">${tenseName(x)}</option>`).join('')}
    </select>
    <div class="card" id="q"></div>`;
  $('#tense').onchange = newConjugate;
  newConjugate();
}

function newConjugate() {
  const tense = pickTense($('#tense').value);
  const v = rand(VERBS);
  const s = rand(SUBJECTS);
  cur = { tense, answer: tense.phrase(v, s) };
  answered = false;

  $('#q').innerHTML = `
    <p class="meta">${tenseName(tense)}</p>
    <p class="big">${cap(s)} <b>${v.base}</b></p>
    <p class="hint">${v.es}</p>
    <form id="form">
      <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false">
      <button id="btn">${tr('check')}</button>
    </form>
    <p id="fb" class="fb"></p>`;

  $('#form').onsubmit = e => {
    e.preventDefault();
    if (answered) return newConjugate();
    answered = true;
    const ok = normalize($('#ans').value) === cur.answer;
    recordTense(tense.id, ok);
    feedback(ok, cur.answer);
  };
  $('#ans').focus();
}

// ---------- Identificar: reconocer el tiempo de una oración ----------

function renderIdentify() {
  view.innerHTML = `
    <p class="meta">${tr('identify_q')}</p>
    <div class="card">
      <p class="big" id="sent"></p>
      <div class="options" id="opts"></div>
      <p id="fb" class="fb"></p>
      <button id="btn" class="hidden"></button>
    </div>`;

  $('#opts').onclick = e => {
    const b = e.target.closest('[data-id]');
    if (!b || answered) return;
    answered = true;
    const ok = b.dataset.id === cur.tense.id;
    recordTense(cur.tense.id, ok);
    document.querySelectorAll('#opts [data-id]').forEach(o => {
      o.disabled = true;
      if (o.dataset.id === cur.tense.id) o.classList.add('right');
    });
    if (!ok) b.classList.add('wrong');
    feedback(ok, tenseName(cur.tense));
  };
  $('#btn').onclick = newIdentify;
  newIdentify();
}

function newIdentify() {
  const v = rand(VERBS);
  const s = rand(SUBJECTS);
  const tense = rand(TENSES);
  const marker = rand(tense.markers);
  const options = shuffle([tense, ...shuffle(TENSES.filter(x => x !== tense)).slice(0, 3)]);
  cur = { tense };
  answered = false;

  $('#sent').textContent = `${cap(s)} ${tense.phrase(v, s)} ${marker}.`;
  $('#opts').innerHTML = options
    .map(x => `<button data-id="${x.id}">${tenseName(x)}</button>`).join('');
  $('#fb').textContent = '';
  $('#btn').classList.add('hidden');
}

// ---------- Ahorcado: completar la palabra ----------

const FORMS = ['base', 'past', 'pp'];
let hang = null;

function renderHangman() {
  view.innerHTML = `
    <p class="meta">${tr('hangman_help')}</p>
    <div class="card">
      <p class="meta" id="hint"></p>
      <p class="word" id="word"></p>
      <p class="meta" id="lives"></p>
      <div class="keys" id="keys"></div>
      <p id="fb" class="fb"></p>
      <button id="btn" class="hidden">${tr('new_word')}</button>
    </div>`;

  $('#keys').onclick = e => {
    const k = e.target.closest('[data-key]');
    if (k) guess(k.dataset.key);
  };
  $('#btn').onclick = newHang;
  onKey = e => {
    if (/^[a-z]$/i.test(e.key)) guess(e.key.toLowerCase());
  };
  newHang();
}

function newHang() {
  const v = rand(VERBS);
  const form = rand(FORMS);
  const word = v[form];
  // Muestra ~60% de las letras (nunca la primera) y el resto hay que adivinarlo
  let slots = word.split('').map((c, i) => (i > 0 && Math.random() < 0.4 ? c : '_'));
  if (!slots.includes('_')) slots[slots.length - 1] = '_';

  hang = { word, slots, guessed: new Set(), lives: 6, over: false };
  $('#hint').textContent = `${v.es} · ${tr('form_' + form)}`;
  $('#keys').innerHTML = 'abcdefghijklmnopqrstuvwxyz'.split('')
    .map(c => `<button data-key="${c}">${c}</button>`).join('');
  $('#fb').textContent = '';
  $('#btn').classList.add('hidden');
  drawHang();
}

function guess(letter) {
  if (!hang || hang.over || hang.guessed.has(letter)) return;
  hang.guessed.add(letter);
  $('#keys [data-key="' + letter + '"]').disabled = true;

  if (hang.word.includes(letter)) {
    hang.word.split('').forEach((c, i) => { if (c === letter) hang.slots[i] = c; });
  } else {
    hang.lives--;
  }

  const won = !hang.slots.includes('_');
  const lost = hang.lives === 0;
  if (won || lost) finishHang(won);
  drawHang();
}

function finishHang(won) {
  hang.over = true;
  if (!won) hang.slots = hang.word.split('');
  recordHangman(won);
  $('#fb').innerHTML = won
    ? `<span class="ok">${tr('won')}</span>`
    : `<span class="bad">${tr('lost')}</span> ${tr('answer')}: <b>${hang.word}</b>`;
  $('#btn').classList.remove('hidden');
  $('#btn').focus();
}

function drawHang() {
  $('#word').textContent = hang.slots.join(' ');
  $('#lives').textContent = `${tr('lives')}: ${'♥'.repeat(hang.lives)}${'·'.repeat(6 - hang.lives)}`;
}

// ---------- Progreso ----------

function renderProgress() {
  view.innerHTML = `
    <div class="table-wrap">
      <table>
        <tr><th>${tr('col_tense')}</th><th>${tr('hits')}</th><th></th></tr>
        ${TENSES.map(x => {
          const s = progress.tenses[x.id] || { ok: 0, total: 0 };
          const pct = s.total ? Math.round(s.ok / s.total * 100) : 0;
          return `<tr>
            <td>${tenseName(x)}</td>
            <td>${s.ok}/${s.total}</td>
            <td><div class="bar"><span style="width:${pct}%"></span></div></td>
          </tr>`;
        }).join('')}
      </table>
    </div>
    <p class="meta">${tr('hangman_won')}: ${progress.hangman.won} · ${tr('hangman_lost')}: ${progress.hangman.lost}</p>
    <button id="reset" class="ghost">${tr('reset')}</button>`;

  $('#reset').onclick = () => {
    if (confirm(tr('reset_confirm'))) {
      resetProgress();
      render();
    }
  };
}

render();
