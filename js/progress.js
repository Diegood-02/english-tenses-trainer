// Progreso guardado en el navegador (localStorage). Si no está disponible, la app sigue funcionando.
const PROGRESS_KEY = 'ett-progress';

const emptyProgress = () => ({ tenses: {}, hangman: { won: 0, lost: 0 } });

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}

let progress = loadProgress();

function recordTense(tenseId, ok) {
  const s = progress.tenses[tenseId] || { ok: 0, total: 0 };
  s.total++;
  if (ok) s.ok++;
  progress.tenses[tenseId] = s;
  saveProgress();
}

function recordHangman(won) {
  progress.hangman[won ? 'won' : 'lost']++;
  saveProgress();
}

function resetProgress() {
  progress = emptyProgress();
  saveProgress();
}
