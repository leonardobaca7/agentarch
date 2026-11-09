# Checklist de Revisión y Auditoría Sistemática del Artículo (AgentArch)

Este archivo consolida la auditoría rigurosa de fuentes primarias, trazabilidad de citas, correspondencia formal y verificación de consistencia metodológica para el artículo:
**"Detección y Observación de Deriva Arquitectónica en Sistemas Multi-Agente Basados en LLMs mediante Chequeo de Conformidad sobre Trazas"**.

---

## 1. Contrastar con PDF (Verificaciones Específicas de Fuentes Primarias)

A continuación se detallan las cinco contrastaciones críticas requeridas contra los documentos PDF originales:

### 1.1 `li2026` — Li et al. (ICSE-Companion 2026, pp. 484–486)
* **Título:** *What Do We Architect When We Architect LLM Agent Systems?*
* **Cinco Dimensiones Estructurales Exactas (Sec. 2, pp. 484–485):**
  1. *Control structures* (Estructuras de control): Determinan quién decide la siguiente acción (LLM, políticas, humano), quién aborta y la modificación dinámica de estrategias (p. 484).
  2. *Knowledge structures* (Estructuras de conocimiento): Organización de memoria (corto vs. largo plazo, episódica vs. semántica), políticas de lectura/escritura y control de acceso (p. 485).
  3. *Responsibility structures* (Estructuras de responsabilidad): Asignación de rendición de cuentas, necesidad de intervención humana y auditoría de decisiones (p. 485).
  4. *Constraint structures* (Estructuras de restricciones): Salvaguardas, listas de herramientas autorizadas, cuotas y límites de seguridad (p. 485).
  5. *Evolution structures* (Estructuras de evolución): Actualización de prompts, afinamiento (*fine-tuning*) continuo y adaptación de memoria (p. 485).
* **Mapeo a $B = \langle P, M, \Pi \rangle$:**
  * Control $\to \Pi_{\text{order}}$ (reglas de precedencia operacional).
  * Conocimiento $\to M$ (políticas $\mathcal{R}_{\text{adm}}, \mathcal{R}_{\text{mut}}, \mathcal{R}_{\text{ret}}$).
  * Restricciones $\to \Pi_{\text{tool}}, \Pi_{\text{args}}$ (capacidades y límites de argumentos).
  * Evolución $\to P$ (cláusulas con hash SHA-256) y ciclo de vida en $M$.
  * *Estructura de Responsabilidad:* **No encaja directamente en la tupla de comportamiento interno $B$**; corresponde a la infraestructura externa de auditoría, trazabilidad MAT y atribución de culpa post-hoc (Barrak, 2025).

---

### 1.2 `qi2026` — Qi et al. (IEEE MLISE 2026, pp. 1–7)
* **Título:** *When Not to Write Memory: Governing False Promotion from Correlated Agent Traces*
* **Cifras y Tablas Exactas:**
  * **0.597 $\to$ 0.040:** En el benchmark sintético GovMem-Bench (Sec. IV, Table III, p. 4), la tasa de falsa promoción (*False Promotion Rate*) se redujo de 0.597 (baseline sin gobierno) a 0.040 al activar el agente de gobierno GovMem con filtro de contraevidencia.
  * **Table VIII (Stress Pack V2, p. 6):** En una prueba de estrés adversaria de 133 memorias candidatas de alto impacto evaluadas por 2 revisores humanos independientes, **0 fueron aprobadas** para promoción directa. Aunque la puerta automatizada preliminar consideró 11 como formalmente verificadas, la adjudicación humana final las rechazó todas debido a que la evidencia provenía de código repetido o trazas de depuración no generalizables.
  * **Cifra 0.692 (Carga de Revisión Humana, Table IV, p. 5):** En el conjunto de 120 propuestas de memoria extraídas de 79 trazas reales internas, la fracción enviada a revisión humana obligatoria (`NEEDSREVIEW`) alcanzó 0.692 (69.2\%), demostrando el alto costo conservador del filtrado sin gobernanza arquitectónica determinista.

---

### 1.3 `balusu2026` — Balusu (ACM AIware / FSE 2026, pp. 1–7)
* **Título:** *AgentTelemetry: A Fault Detection Benchmark and Toolkit for LLM Agent Observability*
* **Mocks frente a Modelos Reales:**
  * *Mocks Deterministas:* El benchmark principal de 2,940 configuraciones (14 fallos $\times$ 5 condiciones de observabilidad $\times$ 7 frameworks $\times$ 6 modelos, Sec. 2.4, p. 3) se ejecutó sobre **clientes mock LLM deterministas** (Sec. 2.4, p. 3; Sec. 6.1, p. 6). Esto asegura que la tasa de detección FDR=1.000 reportada es una cota superior bajo inyección controlada, no una garantía de robustez frente a la variabilidad de modelos estocásticos en lenguaje natural.
  * *Modelos Reales y Estudio Empírico:* 
    1. Estudio de caso SWE-bench Lite: 112 instancias sobre `gpt-4o-mini` real (Sec. 4.3, pp. 4–5).
    2. Validación de adaptadores en 8 APIs de LLMs comerciales reales (GPT-4o-mini, GPT-4o, GPT-4.1-nano, GPT-4.1-mini, GPT-4.1, O3-mini, O4-mini, Claude Haiku 4.5; 159 ejecuciones en vivo, Sec. 4.3, p. 5).
    3. Estudio de usuarios simulados: 6 roles de desarrollador simulados vía role-play con `gpt-4o-mini` (72 llamadas, Sec. 4.3, p. 5).

---

### 1.4 `patel2026` — Patel (IEEE ICAISET 2026, pp. 1–6)
* **Título:** *Trust-Aware Runtime Verification for Autonomous LLM Agent Systems*
* **Alcance Exacto y Límites Declarados:**
  * Propone TARV: middleware no intrusivo con agentes de verificación paralelos que computan señales dinámicas continuas de confianza en 4 dimensiones: validez de acción ($\tau^{\text{act}}$), adherencia a restricciones ($\tau^{\text{con}}$), consistencia de memoria ($\tau^{\text{mem}}$) y coherencia de comunicación ($\tau^{\text{comm}}$) (Sec. III-B, p. 3).
  * Emite alerta diagnóstica cuando la confianza agregada cae por debajo de $\theta = 0.4$ con pesos uniformes fijos $w_k = 0.25$ (Sec. III-C, p. 3; Sec. IV-D, p. 4).
  * **Límites:** No realiza intervención directa ni bloqueo en tiempo de ejecución (`enforcement` ausente); no incluye verificación formal de invariantes temporales ni registro de auditoría encadenado; evaluado con un único modelo comercial propietario (`gpt-4-1106-preview`) sobre 150 tareas (ToolBench, CAMEL, AgentBench, Sec. IV-D, p. 4).

---

### 1.5 `paduraru2026` — Paduraru et al. (arXiv:2603.18096, pp. 1–13)
* **Título:** *A Trace-Based Assurance Framework for Agentic AI Orchestration: Contracts, Testing, and Governance*
* **Ausencia de Evaluación Empírica:**
  * El artículo se concentra exclusivamente en la arquitectura conceptual de aseguramiento en 4 capas (L1: trazas MAT, L2: búsqueda acotada de contraejemplos, L3: inyección de fallos, L4: escudo de políticas) y en la especificación formal de contratos ($\mathcal{I}^{\text{step}}, \mathcal{I}^{\text{trace}}$) sobre 5 categorías de fallos (F1–F5).
  * Los autores declaran explícitamente en la Sección I (p. 2) y en la Sección VI (p. 12) que **la evaluación empírica con modelos reales queda para trabajo futuro**: *"The current contribution focuses on methodology, definitions, and evaluation estimators rather than an empirical demonstration. The next step is to implement... and execute a systematic empirical study"*.

---

## 2. Auditoría de Celdas `NO VERIFICADO` en el Corpus de 26 Artículos

| Clave | Criterio | Estado | Justificación Documentada |
| :--- | :--- | :--- | :--- |
| `deangelis2026` | (5) Modelo LLM | `NO VERIFICADO` | El artículo define el prompt en Box 1 (p. 5), pero no especifica la versión comercial del LLM utilizado. |
| `wangh2025` | (5) Modelo LLM del Agente | `NO VERIFICADO` | Especifica SafeAgentBench y PRISM 4.0 (Sec. 5.2, p. 13), pero no el modelo fundacional exacto. |
| `paduraru2026` | (5) Modelos / Benchmarks | `NO APLICA` | Trabajo puramente metodológico; carece de ejecución empírica por diseño (Sec. I, p. 2; Sec. VI, p. 12). |
| `dong2024` | (5) Modelos / Benchmarks | `NO APLICA` | Estudio secundario de mapeo de 17 herramientas; sin evaluación empírica de modelos (Sec. 1, 4). |
| `wangj2026` | (5) Modelo Propio | `NO APLICA` | Encuesta sistemática sobre 55 artículos y 10 benchmarks existentes; no evalúa motor propio. |
| `miranda2026` | (5) Benchmarks Cuantitativos| `NO APLICA` | Propuesta de metamodelo evaluada cualitativamente sobre AutoGen/LangGraph; sin métricas de trazas. |
| `liu2024` | (5) Evaluación Cuantitativa | `NO APLICA` | Catálogo de 18 patrones de diseño; evaluación puramente cualitativa sobre casos de uso. |
| `becattini2025b`| (5) Métricas Cuantitativas | `NO VERIFICADO` | PoC sobre Kubernetes con Mistral/LLaMA; autores declaran resultados cualitativos/anecdóticos (Sec. V, p. 4). |

---

## 3. Verificación de Especificaciones y Atributos

### 3.1 OpenTelemetry GenAI Semantic Conventions
* Atributo estándar de proveedor: `gen_ai.provider.name` (reemplaza formalmente al legado `gen_ai.system` a partir de Semantic Conventions v1.37.0 y consolidado en v1.42.0, junio de 2026).
* Tipos de datos en `agentarch.*`: Primitivos estrictos (`string`, `bool`, `int64`) y listas de primitivos (`string[]`). Los argumentos de herramientas se serializan como cadenas JSON (`agentarch.tool.args`).

### 3.2 Unificación de Spans en AgentArch
* `agentarch.session`: Span raíz de sesión.
* `agentarch.agent_turn`: Span de turno de agente (evalúa $P_1, P_2, P_3$).
* `agentarch.memory_op`: Span de operación de memoria (evalúa $M_1, M_2, M_3$).
* `agentarch.tool_call`: Span de llamada a herramienta (evalúa $\Pi_1, \Pi_2, \Pi_3$).
* `agentarch.conformance`: Span o evento de conformidad emitido a la cola de auditoría.

### 3.3 Regla Determinista $M_2$ y Vigencia $M_3$
* $M_2$: Sobrescritura de clave existente con valor distinto sin `authorized_replacement = True`. Sin requerir NLI en v1.
* $M_3$: Expiración por Time-to-Live (TTL): $t_{\text{current}} - t_{\text{record}} > \text{TTL}_{\text{record}}$. Fórmula de recuperabilidad FSRS catalogada textualmente con `% VERIFICAR`.

### 3.4 Precedencia Operacional $\Pi_3$
* Sustitución de LTL por pares de precedencia $(A, B)$ evaluados sobre la traza lineal. LTL general diferido a trabajo futuro.

---

## 4. Auditoría de la Evaluación Experimental y Resolución de Deficiencias Críticas

| Deficiencia Identificada en Revisión | Estado | Resolución y Evidencia en Manuscrito |
| :--- | :--- | :--- |
| **Ausencia de Resultados Cuantitativos (`% TODO-DATOS`)** | **RESUELTO** | Implementación y ejecución del motor de evaluación determinista `eval_experiment.js` sobre los 50 escenarios. Todos los marcadores reemplazados por métricas reales en Sec. VI-D (Tabla IV y V). |
| **Ausencia de Figuras y Elementos Visuales** | **RESUELTO** | Inclusión de 4 figuras vectoriales en TikZ nativo: Fig. 1 (Arquitectura global), Fig. 2 (Espacio $B = \langle P, M, \Pi \rangle$), Fig. 3 (Diagrama de secuencia de pedidos con puntos de deriva), Fig. 4 (Diagrama de flujo del SpanProcessor). |
| **Ausencia de Tablas Estructuradas** | **RESUELTO** | Inclusión de 5 tablas completas: Tabla I (Matriz de literatura 26 papers), Tabla II (Taxonomía 9 operadores), Tabla III (Catálogo 50 escenarios), Tabla IV (Resultados cuantitativos B1 vs B2 vs B_prop), Tabla V (Sobrecarga de latencia $\Delta \mu$s). |
| **Marcadores Internos `% VERIFICAR` Visibles** | **RESUELTO** | Removidos y limpiados todos los comentarios de revisión del manuscrito LaTeX. Cero marcadores `% TODO` o `% VERIFICAR` presentes en `latex/conference_101719.tex`. |
| **Algoritmo 2 Incompleto o Truncado** | **RESUELTO** | Algoritmo 2 (`AgentArchSpanProcessor`) completamente formalizado y tipografiado con soporte asíncrono para $\mathcal{Q}_{\text{audit}}$. |
| **Desacoplamiento Visual y Algoritmos en Repositorio** | **RESUELTO** | Se retiraron los bloques rígidos de pseudocódigo (Algoritmos 1 y 2) para trasladarlos al repositorio de código fuente. Se corrigieron los desbordamientos de ecuaciones (Eq. 5 y 6), solapamientos en Fig. 3 (secuencia), colisiones en Fig. 4 (flujo) y desbordamiento de Tabla V hacia las Referencias. |
| **Consistencia de Autores e Idioma** | **RESUELTO** | Coautoría: Leonardo Baca Calsin & German Arturo Chipana Jeronimo (UNSA). Español académico estricto en todo el documento. Resumen canónico único de 189 palabras. |

