# English Tenses

Aplicación web para practicar los tiempos verbales en inglés. / Web app to practice English verb tenses.

**Sitio / Live:** https://diegood-02.github.io/english-tenses-trainer/

## Modos

- **Verbos:** busca un verbo y consulta sus formas y los 12 tiempos, con pronunciación.
- **Conjugar:** escribe la forma correcta (sujeto + verbo + tiempo).
- **Identificar:** elige el tiempo de una oración (atajos 1–4).
- **Ahorcado:** completa la palabra (infinitivo, pasado o participio).
- **Progreso:** precisión por tiempo, nivel, racha y partidas.

Incluye repetición espaciada (repite más lo que fallas), racha diaria, XP y niveles, meta diaria, modo claro/oscuro, interfaz en español e inglés, y se puede instalar como app con soporte sin conexión (PWA). El progreso se guarda en el navegador.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm test         # pruebas (Vitest)
npm run build    # build de producción en dist/
```

Cada push a `main` ejecuta las pruebas y publica en GitHub Pages con GitHub Actions.

## Estructura

```
src/
  core/    lógica pura: tiempos, repetición espaciada, progreso, almacenamiento
  data/    verbos
  ui/      iconos, voz, tema, efectos y recompensas
  views/   inicio, verbos, conjugar, identificar, ahorcado, progreso
tests/     pruebas de la lógica
public/    manifest, icono y service worker
```

Para agregar verbos, añade una fila en `src/data/verbs.js`: `[infinitivo, pasado, participio, -ing, 3.ª persona, traducción]`.
