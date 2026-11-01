const STRINGS = {
  es: {
    nav_explore: 'Verbos', nav_conjugate: 'Conjugar', nav_identify: 'Identificar',
    nav_hangman: 'Ahorcado', nav_progress: 'Progreso',
    search: 'Buscar verbo…', check: 'Comprobar', next: 'Siguiente',
    correct: '¡Correcto!', wrong: 'Incorrecto.', answer: 'Respuesta',
    all_tenses: 'Todos los tiempos', identify_q: '¿Qué tiempo verbal es?',
    lives: 'Vidas', won: '¡Ganaste!', lost: 'Perdiste.', new_word: 'Nueva palabra',
    reset: 'Reiniciar progreso', reset_confirm: '¿Borrar todo el progreso?',
    hits: 'Aciertos', formula: 'Fórmula', col_tense: 'Tiempo',
    hangman_won: 'Victorias', hangman_lost: 'Derrotas',
    form_base: 'infinitivo', form_past: 'pasado', form_pp: 'participio',
    hangman_help: 'Completa la palabra en inglés. Pista: traducción y forma.',
  },
  en: {
    nav_explore: 'Verbs', nav_conjugate: 'Conjugate', nav_identify: 'Identify',
    nav_hangman: 'Hangman', nav_progress: 'Progress',
    search: 'Search verb…', check: 'Check', next: 'Next',
    correct: 'Correct!', wrong: 'Wrong.', answer: 'Answer',
    all_tenses: 'All tenses', identify_q: 'Which tense is it?',
    lives: 'Lives', won: 'You won!', lost: 'You lost.', new_word: 'New word',
    reset: 'Reset progress', reset_confirm: 'Delete all progress?',
    hits: 'Correct', formula: 'Formula', col_tense: 'Tense',
    hangman_won: 'Wins', hangman_lost: 'Losses',
    form_base: 'base form', form_past: 'past', form_pp: 'past participle',
    hangman_help: 'Complete the English word. Hint: translation and form.',
  },
};

let lang = (() => {
  try { return localStorage.getItem('ett-lang') || 'es'; } catch { return 'es'; }
})();

const tr = key => STRINGS[lang][key] || key;
const tenseName = tense => tense[lang];

function setLang(next) {
  lang = next;
  try { localStorage.setItem('ett-lang', next); } catch {}
}
