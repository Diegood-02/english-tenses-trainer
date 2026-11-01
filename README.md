# English Tenses

Aplicación web para practicar los tiempos verbales en inglés. / Web app to practice English verb tenses.

**Sitio / Live:** https://diegood-02.github.io/english-tenses-trainer/

## Secciones

**Aprender**
- **Tiempos verbales:** los 12 tiempos con línea de tiempo, usos con ejemplos, estructura (afirmativa, negativa y pregunta) y palabras clave.
- **Verbos:** más de 200 verbos con sus formas, nivel y conjugación en los 12 tiempos.
- **Tarjetas:** memoriza el pasado y el participio de los verbos.

**Practicar**
- **Conjugar:** escribe la forma correcta en afirmativa, negativa o pregunta (acepta contracciones).
- **Identificar:** elige el tiempo de una oración (atajos 1–4).
- **Escuchar:** oye una oración y reconoce su tiempo.
- **Escribir:** ordena las palabras de una oración o escribe un dictado.
- **Contrarreloj:** 60 segundos para identificar tantos tiempos como puedas.
- **Repaso de errores:** repite solo lo que fallaste.
- **Ahorcado:** completa la palabra.

**Niveles (MCER):** elige A1, A2, B1 o B2 y la práctica usa los tiempos y verbos de ese nivel y los anteriores. La clasificación de los verbos es aproximada.

También incluye repetición espaciada, racha diaria, XP y rangos, meta diaria, modo claro/oscuro, interfaz en español e inglés, pronunciación con la voz del navegador y se puede instalar como app con soporte sin conexión (PWA). El progreso se guarda en el navegador.

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
  core/    lógica pura: conjugación, respuestas, repetición espaciada, progreso
  data/    verbos y teoría de los tiempos
  ui/      componentes, preguntas, línea de tiempo, nivel, voz, tema y efectos
  views/   una vista por pantalla
tests/     pruebas de la lógica
public/    manifest, iconos y service worker
```

Para agregar un verbo, añade una fila en `src/data/verbs.js`:
`[infinitivo, pasado, participio, -ing, 3.ª persona, traducción, complemento]`.
