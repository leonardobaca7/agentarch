# Verificación de la segunda revisión

Se comprobaron las evidencias de la ampliación realizada el 24 de noviembre de
2026 en Lima. Los metadatos crudos usan UTC y registran el 25 de noviembre.

## Código y datos

- `npm run test:unit`: superado. Incluye los nueve operadores, aislamiento de
  sesiones del SDK, propagación de errores, efectos de negocio y estadísticos.
- `node experiments/verify_live_artifacts.js`: comprueba las 24 respuestas y 78
  tramos del piloto anterior, con ocho planes distintos.
- `node experiments/analyze_multiagent.js`: comprueba las 180 respuestas, sus
  acciones, el contexto transferido, la memoria y los 1 085 tramos de 60 sesiones.
  Recalcula etiquetas, resultados de tarea, matrices y tablas VI–VIII.
- Las 57 sesiones etiquetadas con infracciones coinciden con las alertas del
  verificador. Hay tres conformes y ninguna tarea completa. El análisis conserva
  el desglose por solicitud y operador, incluidas las ausencias de P2 y M3.
- El benchmark contiene cien medias de lote por cada uno de los seis caminos.
  Comprueba 1 000 alertas por lote infractor y cero por lote conforme. Los datos
  originales permanecen en `results/latency_run.json`.
- Los ejecutores medidos y el protocolo proceden de `cd6dc65`, registrado en
  los metadatos. El análisis y el manuscrito se incorporan después de medir.

## Manuscrito y presentación

- Compilación con IEEEtran mediante tres pasadas de pdfLaTeX: siete páginas,
  sin citas indefinidas, referencias cruzadas pendientes ni cajas desbordadas.
- Primera aparición de citas en el texto extraído del PDF: 1–33 en orden.
  Las 33 entradas de la bibliografía están citadas.
- Numeración comprobada en el archivo auxiliar: tablas I–IX y figuras 1–4.
- Se inspeccionaron visualmente las siete páginas del PDF. La Figura 3 está
  en la Sección IV. Las tablas anchas usan las dos columnas de IEEEtran.
- La respuesta a la auditoría se renderizó con Word y se inspeccionaron sus
  tres páginas. El documento editable se entrega junto al PDF del artículo.

La concordancia con el anotador automático no constituye evaluación humana ni
validación independiente de las políticas. El resultado de cero tareas completas
se informa expresamente. La extensión y requisitos finales deben contrastarse
con la convocatoria concreta cuando se seleccione el destino del artículo.
