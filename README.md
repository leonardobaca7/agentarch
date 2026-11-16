# AgentArch: Runtime Architectural Drift Detection in LLM Multi-Agent Systems

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](pyproject.toml)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](package.json)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-SemConv_v1.42.0-orange.svg)](https://opentelemetry.io/)

Official reference implementation and companion research artifact for the paper:

> **"Detección de Deriva Arquitectónica en Sistemas Multi-Agente Basados en Modelos de Lenguaje mediante Chequeo de Conformidad sobre Trazas"**
> *Leonardo Baca Calsin & German Arturo Chipana Jeronimo*
> Departamento de Ingeniería de Sistemas e Informática, Universidad Nacional de San Agustín de Arequipa (UNSA), Arequipa, Perú.

---

## ⚡ Reproducción Rápida con un Solo Comando

Para ejecutar la suite completa de 50 escenarios, evaluar las tres líneas base ($B_1$, $B_2$, $B_{\text{prop}}$), calcular las métricas cuantitativas y generar los artefactos en `results/` y `paper_assets/`:

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
* **Monitor Pasivo Streaming (`AgentArchSpanProcessor`):** Intercepta tramos en `on_end(span)` y emite alertas estructuradas a una cola de auditoría asíncrona ($\mathcal{Q}_{\text{audit}}$) sin suspender, bloquear ni reescribir la inferencia del modelo.
* **Microbenchmark del verificador:** mide llamadas directas a onEnd sobre tramos sintéticos conformes. Los resultados y el entorno están en results/.

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

## 👥 Autores y Contacto

* **Leonardo Baca Calsin** (`lbacac@unsa.edu.pe`)
  *Universidad Nacional de San Agustín de Arequipa (UNSA)*, Arequipa, Perú.
* **German Arturo Chipana Jeronimo** (`gchipanaj@unsa.edu.pe`)
  *Universidad Nacional de San Agustín de Arequipa (UNSA)*, Arequipa, Perú.

---

## Citación

El manuscrito de AgentArch está en preparación. Los metadatos del software se
encuentran en [CITATION.cff](CITATION.cff).
