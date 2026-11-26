# AgentArch

Monitor de deriva arquitectónica para sistemas multiagente basados en modelos de lenguaje. Contrasta trazas con restricciones de prompts, memoria y herramientas, y asocia cada alerta con una sesión y un paso de ejecución.

Artefacto del artículo **Detección de deriva arquitectónica en sistemas multiagente basados en modelos de lenguaje mediante chequeo de conformidad sobre trazas**, de Leonardo Baca Calsin y German Arturo Chipana Jeronimo, Universidad Nacional de San Agustín de Arequipa.

## Artículo y documentación

- [Artículo IEEE en PDF](paper/articulo.pdf) y [fuente LaTeX](paper/articulo.tex).
- [Arquitectura y semántica de las reglas](docs/arquitectura.md).
- [Diseño experimental y reproducción](docs/experimentos.md).
- [Resultados y registros de evidencia](docs/resultados.md).
- [Bibliografía y fuentes editoriales](docs/referencias.md).
- [Verificación del manuscrito](paper/verification.json).

## Uso

La evaluación publicada utiliza JavaScript y Node.js 22.15.0, con OpenTelemetry SDK 2.12.1. La implementación Python complementaria está en `src/agentarch/` y sus dependencias en `pyproject.toml`.

```sh
npm ci
npm run test:unit
npm run paper:assets
```

El último comando regenera cuatro tablas del artículo leyendo los resultados conservados, sin ejecutar modelos ni modificar los datos. Para compilar el PDF, desde `paper/`:

```sh
pdflatex -interaction=nonstopmode -halt-on-error articulo.tex
pdflatex -interaction=nonstopmode -halt-on-error articulo.tex
```

La evaluación guionizada se ejecuta con `npm run eval`. Este comando escribe resultados y tablas; para repetir mediciones conservando los registros publicados conviene usar otra copia del repositorio. Las ejecuciones con modelos requieren un servidor local compatible con `/chat/completions`; su configuración está en la documentación experimental.

## Resultados principales

| Conjunto | Sesiones | Conformes | Tareas completas |
| --- | ---: | ---: | ---: |
| Corpus guionizado | 50 | 10 | No evaluado |
| Pedidos, Qwen3-0.6B | 60 | 3 | 0 |
| Pedidos, Qwen3-1.7B | 12 | 0 | 0 |
| Control de acciones escrito a mano | 12 | 10 | 12 |
| Consultas con interfaz tipada | 30 | 30 | 30 |
| Consultas con esquema general | 30 | 4 | 0 |

AgentArch detectó las 40 infracciones guionizadas y las 57 sesiones infractoras del conjunto principal, coincidiendo con el primer paso de las etiquetas de referencia. El anotador automático expresa las mismas políticas mediante código separado; esa coincidencia comprueba consistencia de implementación. La revisión de diez sesiones tuvo acuerdo inicial exacto en nueve y un consenso de quince pares operador/paso coincidentes con el monitor.

La conformidad describe el cumplimiento de las reglas observadas. La finalización se comprueba mediante los efectos de los servicios. Los conjuntos se informan por separado: sus diferencias de tareas, interfaces y muestreo no permiten sumarlos como una única estimación de rendimiento.

## Organización

| Directorio | Contenido |
| --- | --- |
| `src/agentarch/` | Reglas, verificador, cola y adaptador de trazas |
| `spec/` | Especificación de roles y restricciones |
| `agents/`, `baselines/` | Agentes y configuraciones de comparación |
| `scenarios/` | Trazas controladas y etiquetas |
| `experiments/`, `tests/` | Ejecutores, análisis y pruebas |
| `results/` | Peticiones, respuestas, tramos, formularios y mediciones |
| `paper/`, `paper_assets/` | Artículo IEEE, bibliografía y tablas |
| `docs/` | Explicación técnica y resultados |

## Licencia y cita

Licencia [MIT](LICENSE). Los metadatos para citar el artefacto están en [CITATION.cff](CITATION.cff). La edición editorial corresponde a `v0.7.0-editorial`; los registros experimentales conservan las versiones y configuraciones de sus ejecuciones originales.
