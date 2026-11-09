# Glosario y Notas de Lectura: Terminología Arquitectónica y de Verificación en MAS

Este documento define el glosario canónico de términos adoptado para la redacción académica en español del artículo **AgentArch** (*"Detección de Deriva Arquitectónica en Sistemas Multi-Agente Basados en Modelos de Lenguaje mediante Chequeo de Conformidad sobre Trazas"*). Todas las traducciones y usos de nombres propios deben mantenerse rigurosamente uniformes en todo el manuscrito LaTeX (`latex/conference_101719.tex`) y en los documentos de diseño.

---

## 1. Glosario de Términos Canónicos

| Término en Inglés | Equivalente en Español Adoptado | Regla de Uso y Definición en Manuscrito |
| :--- | :--- | :--- |
| **Architectural Drift** | **Deriva arquitectónica** | Erosión o divergencia entre la arquitectura conceptual (especificación de diseño) y la arquitectura realizada en tiempo de ejecución. |
| **Runtime Verification** | **Verificación en tiempo de ejecución** | Técnica de análisis dinámico que contrasta el comportamiento observable del sistema frente a propiedades formales durante la ejecución. |
| **Conformance Checking** | **Chequeo de conformidad** | Comparación determinista entre una traza de ejecución empírica y un modelo normativo de comportamiento del sistema. |
| **Trace / Execution Trace** | **Traza / Traza de ejecución** | Secuencia lineal estructurada y cronológicamente ordenada de eventos y tramos capturados durante una sesión. |
| **Span** | **Tramo (*span*)** | Mantener como *span* o tramo (*span*); unidad básica de trabajo y telemetría distribuida en el estándar OpenTelemetry. |
| **SpanProcessor** | **SpanProcessor** | Nombre propio de la interfaz del SDK de OpenTelemetry que intercepta el ciclo de vida de los tramos (`on_start`, `on_end`). |
| **OpenTelemetry** | **OpenTelemetry** | Nombre propio del estándar abierto de observabilidad y marco de telemetría distribuida. |
| **Design Science Research** | **Design Science Research (DSR)** | Metodología de investigación enfocada en la creación y evaluación rigurosa de artefactos tecnológicos para resolver problemas prácticos. |
| **Prompt** | **Prompt** | Directiva o contexto de instrucción en lenguaje natural suministrado a un modelo de lenguaje de gran escala. |
| **Tool / Tool Calling** | **Herramienta / Invocación de herramientas** | Funciones externas, servicios web o APIs ejecutables por el agente para interactuar con el entorno. |
| **Audit Queue** | **Cola de auditoría** | Búfer o cola asíncrona a la que el monitor envía eventos de conformidad y alertas estructuradas de violaciones sin bloquear la ejecución. |
| **Enforcement** | **Intervención activa (*enforcement*)** | Acciones de control activo en el flujo de ejecución (bloquear, reescribir argumentos o abortar). Explícitamente fuera de alcance en la v1. |
| **Ground Truth** | **Verdad fundamental (*ground truth*)** | Referencia canónica anotada objetivamente para cada escenario de prueba contra la cual se evalúan las detecciones. |
| **False Promotion** | **Falsa promoción** | Admisión errónea y persistencia en memoria duradera de afirmaciones alucinadas, no verificadas o espurias. |
| **Stale Read** | **Lectura expirada** | Acceso a un registro de memoria cuyo tiempo de vida útil (*Time-to-Live*, TTL) ha caducado respecto a la marca temporal actual. |
| **Precedence Inversion** | **Inversión de precedencia** | Transgresión del orden operacional causal en el cual una acción dependiente $B$ se ejecuta sin la ejecución previa y exitosa de su prerrequisito $A$. |
| **Deterministic Mock Client** | **Cliente simulado determinista (*mock*)** | Componente de prueba que reproduce llamadas prefijadas idénticas para validar la corrección matemática interna del verificador. |
| **Threats to Validity** | **Amenazas a la validez** | Sección metodológica que examina los límites y riesgos en la validez de constructo, interna y externa del estudio. |
| **Time-to-Live (TTL)** | **Tiempo de vida útil (TTL)** | Período de vigencia asignado a un registro de memoria, tras el cual se considera expirado. |
| **Large Language Model (LLM)**| **Modelo de lenguaje de gran escala (LLM)** | Modelos neuronales autorregresivos basados en arquitecturas Transformer entrenados sobre corpus masivos de texto. |
| **Multi-Agent Systems (MAS)** | **Sistemas multi-agente (MAS)** | Arquitecturas distribuidas compuestas por múltiples entidades autónomas que colaboran mediante paso de mensajes y delegación de tareas. |

---

## 2. Pautas Estilísticas y de Notación en LaTeX

1. **Idiomas y Preámbulo:**
   - `\usepackage[utf8]{inputenc}`
   - `\usepackage[spanish,es-nodecimaldot,es-tabla]{babel}` para garantizar títulos automáticos en español (*Resumen*, *Palabras clave*, *Tabla*, *Referencias*) y preservar el punto decimal estándar en ingeniería (`0.040`, `1.42` ms).
2. **Resumen y Palabras Clave:**
   - Resumen único en español académico (189 palabras) con encabezado canónico.
   - Palabras clave en español.
   - Formato estricto IEEEtran con soporte Babel español (`es-nodecimaldot`, `es-tabla`).
3. **Consistencia de Citas y Verificación Empírica:**
   - Únicamente las 26 claves contenidas en `latex/references.bib`.
   - Resultados experimentales empíricos obtenidos mediante el motor de evaluación determinista `eval_experiment.js` sobre los 50 escenarios anotados.
   - Cero marcadores `% TODO-DATOS` y cero notas de revisión `% VERIFICAR` visibles en el manuscrito final.
