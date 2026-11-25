# AgentArch: Runtime Architectural Drift Detection in LLM Multi-Agent Systems

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](pyproject.toml)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](package.json)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-SDK_2.12.1-orange.svg)](https://opentelemetry.io/)

Official reference implementation and companion research artifact for the paper:

> **"Detección de Deriva Arquitectónica en Sistemas Multi-Agente Basados en Modelos de Lenguaje mediante Chequeo de Conformidad sobre Trazas"**
> *Leonardo Baca Calsin & German Arturo Chipana Jeronimo*
> Departamento de Ingeniería de Sistemas e Informática, Universidad Nacional de San Agustín de Arequipa (UNSA), Arequipa, Perú.

---

## ⚡ Reproducción Rápida con un Solo Comando

Para ejecutar la suite guionizada de 50 escenarios y evaluar las tres configuraciones ($B_1$, $B_2$, $B_{\text{prop}}$), calcular las métricas cuantitativas y generar los artefactos en `results/` y `paper_assets/`:

```bash
git clone https://github.com/leonardobaca7/agentarch.git
cd agentarch
node eval_experiment.js
```
*(También puede ejecutarse mediante `npm test` o `node experiments/run_evaluation.js`)*.

---

## 📌 Visión General de la Propuesta

Los sistemas multi-agente (MAS) basados en modelos de lenguaje de gran escala (LLM) coordinan tareas complejas mediante agentes con roles especializados. Sin embargo, sufren de **deriva arquitectónica** (*architectural drift*): la erosión en tiempo de ejecución de los invariantes de diseño debido a mutaciones de directivas en prompts, corrupción de memoria e inversiones de orden operacional.

**AgentArch** introduce un marco formal y determinista de chequeo de conformidad sobre trazas OpenTelemetry:
* **Espacio de Comportamiento $B = \langle P, M, \Pi \rangle$:** Modela formalmente directivas de prompt versionadas criptográficamente con SHA-256 ($P$), estados de memoria gobernados deterministamente ($M$) y reglas de precedencia causal entre herramientas ($\Pi$).
* **Taxonomía de 9 Operadores de Deriva:** Detecta supresión obligatoria ($P_1$), inyección de conflicto ($P_2$), alteración criptográfica ($P_3$), admisión no verificada ($M_1$), sobrescritura destructiva ($M_2$), lecturas caducadas por TTL ($M_3$), herramientas no permitidas ($\Pi_1$), límites de argumentos ($\Pi_2$) e inversiones de precedencia ($\Pi_3$).
* **Monitor pasivo:** el núcleo JavaScript evalúa tramos en `onEnd(span)` y encola eventos. El adaptador `AgentArchOtelProcessor` recibe tramos del SDK y mantiene estado por traceId. La exportación del piloto es local y síncrona.
* **Microbenchmark del verificador:** mide llamadas directas a onEnd sobre tramos sintéticos conformes y con alerta. Se publican muestras, mediana y percentiles de medias por lote en results/latency_paths/.

---

## 📁 Estructura del Repositorio

```text
agentarch/
├── README.md               # Cómo reproducir todo con un comando y documentación
├── LICENSE                 # Licencia MIT de código abierto
├── CITATION.cff            # Metadatos de citación para GitHub y Zenodo
├── pyproject.toml          # Dependencias y configuración de empaquetado Python
├── package.json            # Scripts de ejecución rápida (Node.js)
├── DECISIONES.md           # Registro formal de decisiones de diseño (ADR-001 a ADR-005)
├── spec/                   # Modelo arquitectónico explícito formal
│   └── architecture_order_support.yaml  # Especificación declarativa en YAML de B = <P, M, Pi>
├── src/agentarch/          # Núcleo del verificador: reglas P/M/Pi, verificador offline, SpanProcessor
│   ├── __init__.py / index.js
│   ├── models.py           # Dataclasses de tramos, violaciones y eventos de auditoría
│   ├── rules_p.py          # Operadores de deriva de prompt (P1, P2, P3)
│   ├── rules_m.py          # Operadores de deriva de memoria (M1, M2, M3)
│   ├── rules_pi.py         # Operadores de deriva de políticas (Pi1, Pi2, Pi3)
│   ├── offline_verifier.py # Verificador determinista por lotes sobre trazas consolidadas
│   ├── span_processor.py   # Implementación OpenTelemetry SpanProcessor (on_end)
│   └── audit_queue.py      # Cola asíncrona no bloqueante Q_audit
├── agents/                 # Agente sintético de soporte de pedidos (e-commerce)
│   ├── order_triage.js / .py       # Rol OrderTriage (triaje e intenciones)
│   ├── inventory_agent.js / .py    # Rol InventoryAgent (inventario y reservas)
│   ├── billing_agent.js / .py      # Rol BillingAgent (reembolsos y notas de crédito)
│   └── local_llm_adapter.js / .py  # Adaptador para endpoints locales (Ollama / vLLM)
├── baselines/              # Líneas base de comparación experimental
│   ├── baseline_b1_otel.js / .py       # B1: Observabilidad pasiva OTel (sin modelo formal)
│   └── baseline_b2_agentspec.js / .py  # B2: Reglas de contorno estilo AgentSpec (Wang et al., 2026)
├── scenarios/              # Corpus de 50 escenarios controlados y etiquetas canónicas
│   ├── ground_truth.json   # Etiquetas canónicas de verdad fundamental (categoría, paso, operador)
│   ├── scenario_loader.js  # Cargador modular de escenarios
│   ├── nominal/            # S01 a S10: Escenarios conformes regulares
│   ├── prompt/             # S11 a S22: Inyecciones de deriva de prompt (P1, P2, P3)
│   ├── memory/             # S23 a S36: Inyecciones de deriva de memoria (M1, M2, M3)
│   └── policy/             # S37 a S50: Inyecciones de deriva de políticas (Pi1, Pi2, Pi3)
├── experiments/            # Ejecutores de evaluación y benchmarking
│   ├── run_evaluation.js   # Ejecutor maestro de los 50 escenarios para B1, B2 y B_prop
│   └── benchmark_latency.js # Microbenchmark de alta precisión (N = 50,000 iteraciones)
├── results/                # Salidas crudas versionadas
│   ├── summary_metrics.json # Métricas cuantitativas consolidadas (JSON)
│   ├── scenario_results.csv # Veredicto paso a paso por escenario (CSV)
│   └── latency_benchmark.csv# Mediciones de microsegundos con desviación estándar
├── paper_assets/           # Tablas .tex generadas automáticamente por los scripts
│   ├── tabla_iv_resultados.tex # Tabla LaTeX de resultados comparativos B1 vs B2 vs B_prop
│   └── tabla_v_latencia.tex   # Tabla LaTeX de sobrecarga temporal por tipo de tramo
└── tests/                  # Suite de pruebas unitarias de sanidad
    ├── test_drift_operators.js # Validación unitaria de los 9 operadores (9/9 passing)
    └── test_verifier.py        # Pruebas unitarias en Python
```

---

## Evaluación guionizada

El ejecutor JavaScript entrega trazas sintéticas al verificador. Los 50 escenarios cubren
un flujo nominal y nueve patrones de deriva con repeticiones por patrón. El ejecutor
usa scenarios/scenario_loader.js y scenarios/ground_truth.json. Las configuraciones
de comparación son un detector de HTTP >= 500 (B1) y reglas de capacidades y argumentos
inspiradas en AgentSpec (B2).

| Configuración | Derivas detectadas | Alertas en nominales | Precisión | Exhaustividad | F1 | Exactitud del primer paso |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| B1 | 0/40 | 0/10 | — | 0 % | 0 % | 0 % |
| B2 | 10/40 | 0/10 | 100 % | 25 % | 40 % | 25 % |
| AgentArch | 40/40 | 0/10 | 100 % | 100 % | 100 % | 100 % |

La exactitud del primer paso usa los 40 casos con deriva como denominador.
La precisión de B1 es indefinida por ausencia de alertas. El JSON conserva 0
como convención de exportación.

### Latencia del verificador

50 lotes de 1 000 llamadas cronometradas por tipo, con calentamiento.
Cada observación es el tiempo medio por llamada de un lote. Se informa la media
y la desviación estándar muestral de esas 50 observaciones.

| Tramo | Media (µs) | DE entre lotes (µs) |
| --- | ---: | ---: |
| Turno | 0.189 | 0.218 |
| Memoria | 0.079 | 0.052 |
| Herramienta | 0.582 | 0.157 |

La ejecución versionada se realizó con Node.js 22.15.0 en Windows x64, Intel Core
i7-1165G7. El commit, el entorno y los 50 valores por tipo están en
[latency_run.json](results/latency_run.json). El microbenchmark mide el núcleo
sobre entradas conformes, con hashes preparados, y excluye la ejecución de un LLM,
la exportación de telemetría y el consumo de alertas. Se retiró de la evaluación
la comparación de tiempos por escenario debido a los distintos criterios de parada.

El [artículo en LaTeX](paper/articulo.tex) utiliza IEEEtran en modo conferencia
y carga las tablas generadas desde paper_assets/. Desde el directorio paper,
compilar con pdflatex articulo.tex dos veces para resolver las referencias cruzadas.

---

## Piloto con inferencia real

Se ejecutó Qwen3-0.6B-Q8_0 mediante llama.cpp b12704 y se capturaron tramos con
OpenTelemetry SDK 2.12.1. Ocho solicitudes se repitieron tres veces a temperatura
cero. Los 24 planes fueron válidos y produjeron 78 tramos. Cada sesión asignó
un rol y ejecutó las llamadas generadas en herramientas locales de prueba.

| Configuración | Derivas detectadas | Alertas en sesiones conformes | Primer paso correcto |
| --- | ---: | ---: | ---: |
| B1 | 0/12 | 0/12 | 0/12 |
| B2 | 6/12 | 0/12 | 6/12 |
| AgentArch | 12/12 | 0/12 | 12/12 |

Las réplicas de cada solicitud produjeron el mismo plan. La diversidad efectiva
es de ocho planes, cuatro conformes y cuatro con infracciones. Las etiquetas
provienen de un anotador separado que codifica las mismas políticas: la concordancia
comprueba consistencia de implementación. El piloto
abarca permisos, argumentos y precedencia de herramientas. La cobertura completa
de las nueve reglas se comprueba en la suite guionizada.

El [protocolo](docs/live_pilot_protocol.md) documenta modelo, hash, equipo,
parámetros y reproducción. [Los datos crudos](results/live_pilot/) conservan
peticiones, respuestas, tramos, etiquetas y alertas.

~~~powershell
npm ci
node tests/test_live_integration.js
node experiments/verify_live_artifacts.js
~~~

El protocolo indica cómo iniciar el servidor y ejecutar una nueva medición en un
directorio distinto para preservar los datos. La conexión al modelo propaga los
errores de red y formato. La configuración usa herramientas locales de prueba.

## Ampliación con tres roles y memoria compartida

Doce solicitudes se ejecutaron cinco veces con temperatura 0,7 y semillas 100–104.
Cada sesión contiene tres roles que reciben mensajes, resultados de herramientas
y memoria compartida de los anteriores. Se obtuvieron 60 sesiones válidas, 180
peticiones al modelo, 1 085 tramos del SDK y 60 planes distintos. La unidad de
tarea es la solicitud: son doce grupos de cinco muestras.

| Configuración | VP | FP | VN | FN | Primer paso correcto |
| --- | ---: | ---: | ---: | ---: | ---: |
| B1 | 0 | 0 | 3 | 57 | 0/57 |
| B2 | 33 | 0 | 3 | 24 | 13/57 |
| AgentArch | 57 | 0 | 3 | 0 | 57/57 |

El anotador implementa las mismas políticas mediante código separado. Estos
resultados verifican concordancia y no validación independiente de las políticas.
Seis solicitudes son peticiones benignas: ese nombre describe la intención del
usuario. Sus ejecuciones produjeron infracciones en 27 de 30 sesiones y no deben
confundirse con trayectorias conformes.
Los cuatro tipos observados fuera de herramientas son P1, P3, M1 y M2; P2 y M3
no aparecieron. W10/W11 introducen perturbaciones de prompt en diez sesiones;
otras 47 sesiones presentan infracciones sin esas perturbaciones.

**Finalización de tarea: 0/60.** El criterio adicional comprueba los efectos de
inventario, finanzas y dirección frente al pedido. Las tres sesiones conformes
también quedaron incompletas. El modelo de 0,6 mil millones de parámetros, con
un plan por rol y sin ciclo de reparación, no resolvió estas tareas en esta
configuración. La ausencia de alertas no garantiza la finalización del pedido.

El [protocolo previo](docs/second_audit_protocol.md) fija las solicitudes, la
orquestación y los criterios. Los [datos completos](results/multiagent_run/)
conservan respuestas, mensajes transferidos, efectos, tramos, etiquetas y alertas.
La plantilla inicial se conserva vacía. Los formularios individuales y el consenso
aportados posteriormente por los autores están en results/consolidated_analysis/.

```powershell
npm ci
npm run test:unit
node experiments/analyze_multiagent.js
```

Para repetir la inferencia se requiere iniciar el servidor indicado en el
protocolo y elegir un directorio de salida nuevo. El análisis regenera las
tablas de detección, operadores y solicitudes y comprueba las relaciones entre
peticiones, tramos y resultados. WORKFLOW_ASSET_DIR permite mantener separadas
las tablas de otros conjuntos.

La nueva medición temporal usa cien lotes de mil llamadas en seis caminos.
La cola se consume fuera del intervalo cronometrado y se comprueba el número
de alertas. [Las observaciones y percentiles](results/latency_paths/) incluyen
también el recálculo de percentiles de los datos históricos conservados.
Los percentiles corresponden a medias de lote, no a llamadas individuales.

El nombre AgentArch también identifica el [benchmark de Bogavelli et al.](https://aclanthology.org/2026.aacl-long.44/).
Este repositorio contiene el verificador de conformidad de Baca Calsin y Chipana
Jeronimo. El artículo diferencia ambos trabajos. Los atributos agentarch.* son
una extensión de dominio; la integración con el SDK no implica conformidad
completa con todas las convenciones semánticas GenAI.

## Correcciones de la auditoría consolidada

Los doce planes escritos a mano completaron las doce tareas utilizando el mismo
ejecutor, servicios, memoria y criterio de finalización. Diez fueron conformes;
W10/W11 conservaron las perturbaciones de prompt y sus alertas. Estos controles
validan trayectorias posibles del arnés y permanecen separados de las sesiones
generadas por modelos.

M1 concentra 84 de 141 pares de operador y paso (59,6 %). Al filtrar etiquetas
y alertas y recalcular el primer paso se obtiene:

| Conjunto | Sesiones | Con infracciones | Conformes | Pares coincidentes | Primer paso correcto |
| --- | ---: | ---: | ---: | ---: | ---: |
| Completo | 60 | 57 | 3 | 141/141 | 57/57 |
| Sin M1 | 60 | 38 | 22 | 57/57 | 38/38 |
| Sin W10/W11 | 50 | 47 | 3 | 112/112 | 47/47 |
| Sin ambos | 50 | 28 | 22 | 38/38 | 28/28 |

Todas las variantes tienen cero FP y FN respecto de su criterio filtrado.
Las 22 sesiones conformes sin M1 no son negativos adicionales del monitor completo.
Los resultados están en [consolidated_analysis](results/consolidated_analysis/).

El [protocolo consolidado](docs/consolidated_audit_protocol.md) fija también
una muestra de doce solicitudes con Qwen3-1.7B-Q8_0, a temperatura 0,7 y semilla
100. Los [datos](results/larger_model/) conservan todas las respuestas. El contraste
se realiza con la primera muestra de las mismas solicitudes de Qwen3-0.6B.
La tabla de controles y modelos del artículo informa sus resultados efectivos.
Las doce sesiones de Qwen3-1.7B fueron válidas, pero ninguna fue conforme ni
completó la tarea. En la primera muestra del modelo pequeño hubo una conforme
y cero tareas completas. El tamaño mayor no mejoró la finalización observada.

El benchmark complementario mide lectura vigente y expirada y la entrada al
adaptador del SDK. Este último usa objetos con la forma de ReadableSpan e incluye
conversión, búsqueda, comprobación, drenaje y callback; excluye crear y exportar
tramos. Las diferencias entre los tiempos históricos no son una comparación
emparejada ni prueban una aceleración. Ambos benchmarks históricos calentaban
cada lote. Sus percentiles son percentiles de medias de lote.

## Revisión de los autores y consultas prospectivas

Se recibieron dos formularios individuales y un consenso para diez sesiones.
El acuerdo inicial exacto de conjuntos operador/paso es 9/10; la presencia de
infracción coincide en 10/10 y los conjuntos tienen 14 pares comunes de 15 en la
unión. La discrepancia sobre M1@16 en W04-R1 se conserva y se resuelve en el
consenso. Los quince pares consensuados coinciden con el monitor y el anotador.
Los dos autores coinciden en que las diez tareas están incompletas.

Los [resultados](docs/resultados_revision_autores.md) y el
[análisis](results/human_review/analysis.json) conservan las limitaciones: muestra
dirigida, revisión por autores del sistema y recogida/cegamiento no verificados.
No se atribuye una evaluación externa ni se extiende el resultado a las 60 sesiones.
Los CSV originales se mantienen sin modificar, con sus SHA-256 en el análisis.

Un [protocolo prospectivo](docs/prospective_queries_protocol.md) fija treinta
sesiones de consulta: diez plantillas y tres variantes de datos, semillas 200–229,
temperatura 0,7 y Qwen3-0.6B-Q8_0. Cada rol genera argumentos y mensajes dentro
de una interfaz tipada de consulta, sin escrituras, reservas ni pagos. Se conservan
todos los intentos, sin descartar ni repetir por alertas del monitor. Los
[datos](results/prospective_queries/) y su análisis informan el desglose completo.
Los treinta intentos fueron válidos y conformes, con cero alertas y treinta
consultas completas: noventa peticiones al modelo y 420 tramos del SDK. No hay
casos positivos en este lote, por lo que no estima exhaustividad ni F1 de detección.

La interfaz favorece conformidad antes de inferir: no representa agentes con
acciones libres ni una validación humana del lote nuevo. Sus negativos se
mantienen separados de los tres del estudio original y no se agrupan para
estimar una tasa poblacional. La finalización de una consulta tampoco se compara
como mejora sobre las tareas originales de reserva y pago.

## Supuestos y límites

El 100 % de la suite guionizada describe la cobertura de los casos preparados.
Las repeticiones y la comparación exploratoria con modelos pequeños limitan la generalización.
Para cero alertas en diez nominales, el límite binomial unilateral exacto al 95 %
sería 25,9 % bajo independencia. Los nominales repetidos debilitan ese supuesto.
Para los tres conformes de la ampliación, cero FP daría una cota ilustrativa de
63,2 % bajo independencia. Proceden de solo dos solicitudes. No se agrupan
negativos de corpus, controles y modelos como si fueran una sola población.

La prueba de [metadatos incorrectos](results/instrumentation_sensitivity.json)
muestra que un resumen canónico obsoleto puede ocultar P3 y una marca verified
incorrecta puede ocultar M1. Se regenera con node experiments/instrumentation_sensitivity.js.

## Versión y artículo

La etiqueta v0.5.0-human-review incorpora los formularios recibidos y el lote
prospectivo, y conserva v0.4.0-consolidated-review y las revisiones anteriores.
52eee33 fija el protocolo y ejecutor de consultas antes de inferir.
cd6dc65 identifica benchmark_paths.js
y el ejecutor y protocolo de la
ampliación. bd1c1a1 identifica el código del
microbenchmark original, 73dd953 incorpora esos resultados y el primer manuscrito
y 647f45f identifica el ejecutor del piloto del modelo. Los tiempos guardados
corresponden a sus respectivas ejecuciones. f93051a fija analyze_multiagent.js;
9261a10 añade control y modelo configurable; 9ca896f incorpora exclusiones y el
benchmark complementario. La [verificación de fuentes](docs/verificacion_fuentes_consolidada.md)
documenta las referencias cuestionadas y la detección de MIT por GitHub.

[El fuente IEEE](paper/articulo.tex) y [el PDF](paper/articulo.pdf) incorporan
ambas evaluaciones, los límites del etiquetado automático y los resultados de
tarea. Las correcciones actuales están documentadas en [el informe de revisión y consultas](docs/revision_humana_y_consultas.md).

## 👥 Autores y Contacto

* **Leonardo Baca Calsin** (`lbacac@unsa.edu.pe`)
  *Universidad Nacional de San Agustín de Arequipa (UNSA)*, Arequipa, Perú.
* **German Arturo Chipana Jeronimo** (`gchipanaj@unsa.edu.pe`)
  *Universidad Nacional de San Agustín de Arequipa (UNSA)*, Arequipa, Perú.

---

## Citación

El manuscrito de AgentArch está en preparación. Los metadatos del software se
encuentran en [CITATION.cff](CITATION.cff).
