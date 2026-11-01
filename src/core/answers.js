// Compara respuestas escritas ignorando mayúsculas, puntuación y contracciones
// ("hasn't" = "has not", "won't" = "will not").
export function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\b(\w+)n't\b/g, '$1 not')
    .replace(/[^a-z' ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const isCorrect = (input, expected) => normalizeAnswer(input) === normalizeAnswer(expected);

// Versión contraída para mostrarla como alternativa válida
export const contract = text => text
  .replace(/\bwill not\b/, "won't")
  .replace(/\b(is|are|was|were|has|have|had|does|do|did) not\b/, "$1n't");
