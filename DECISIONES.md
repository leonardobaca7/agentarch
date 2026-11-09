# Registro de Decisiones de Diseño Arquitectónico (ADR) - AgentArch

Este documento formaliza las decisiones de diseño arquitectónico tomadas durante el desarrollo de **AgentArch**, justificando las elecciones técnicas, sus ventajas, compromisos asumidos y delimitaciones de alcance.

---

## ADR-001: Delimitación de Alcance a Detección Pasiva sin Enforcement Activo
* **Estado:** Aceptado (Versión 1.0).
* **Contexto:** En sistemas multi-agente basados en LLMs, la transgresión de invariantes arquitectónicos puede mitigarse interrumpiendo el flujo (bloqueo síncrono de llamadas a herramientas, reescritura de parámetros en vuelo, aborto del turno) o auditando pasivamente en telemetría.
* **Decisión:** La versión 1 (v1) de AgentArch se restringe estrictamente a **detección determinista en tiempo de ejecución y reporte asíncrono de violaciones** a una cola de auditoría ($\mathcal{Q}_{\text{audit}}$). Todo mecanismo de *enforcement* activo (bloqueo, reescritura de logits o interrupción) queda formalmente diferido a trabajo futuro.
* **Justificación:**
  1. *Aislamiento y no invasividad:* Garantiza que el verificador nunca altere el estado interno ni la latencia de decodificación del modelo LLM.
  2. *Compatibilidad OpenTelemetry:* El estándar OpenTelemetry define `SpanProcessor.on_end` como un mecanismo pasivo de observabilidad, no un cortafuegos en línea (*firewall*).
  3. *Auditabilidad forense:* Permite el análisis retrospectivo de trayectorias sin introducir sesgos de ejecución.

---

## ADR-002: Representación de Prompts en Cláusulas Versionadas con Hash SHA-256
* **Estado:** Aceptado (Versión 1.0).
* **Contexto:** Los prompts en MAS contienen directivas de seguridad, rol y restricciones de dominio. Almacenar el texto completo de prompts extensos (de miles de tokens) en cada tramo de telemetría satura el ancho de banda y expone datos potencialmente sensibles.
* **Decisión:** Descomponer los prompts en cláusulas semánticas atómicas versionadas $\langle \text{id}_k, \text{hash}_k \rangle$, donde $\text{id}_k$ es el identificador funcional y $\text{hash}_k = \text{SHA256}(\text{texto}_k)$. La telemetría solo transporta listas de identificadores y hashes.
* **Justificación:**
  1. *Verificación $O(1)$ en memoria:* El verificador comprueba la presencia de directivas obligatorias ($P_1$) y la integridad criptográfica ($P_3$) mediante comparaciones de cadenas cortas.
  2. *Matriz estática de conflictos ($P_2$):* Permite detectar incompatibilidades conocidas entre pares $(\text{id}_a, \text{id}_b) \in \mathcal{M}_{\text{conflict}}$ sin requerir un juez LLM en línea.
  3. *Eficiencia de telemetría:* Reduce la carga útil del tramo de kilobytes a menos de 200 bytes.

---

## ADR-003: Regla Determinista de Memoria ($M_2$) y Vigencia por TTL ($M_3$)
* **Estado:** Aceptado (Versión 1.0).
* **Contexto:** La deriva de memoria en MAS surge por falsa promoción de hechos especulativos ($M_1$), sobrescritura contradictoria de conocimiento consolidado ($M_2$) y lectura de estados expirados ($M_3$). Evaluar la contradicción mediante modelos de inferencia de lenguaje natural (NLI) en tiempo de ejecución introduce latencias inaceptables (>250 ms) e indeterminismo.
* **Decisión:** 
  1. Para $M_2$, adoptar una **regla determinista estricta**: Si una clave existente $k \in \mathcal{K}$ intenta ser sobrescrita con un valor distinto $v' \neq \mathcal{K}[k]$, se declara violación a menos que el tramo contenga explícitamente la bandera `authorized_replacement = True`.
  2. Para $M_3$, adoptar **vigencia determinista por Time-to-Live (TTL)**: El verificador computa $t_{\text{now}} - t_k > \text{TTL}_k$ directamente a partir de las marcas temporales registradas en el tramo.
* **Justificación:**
  1. Garantiza tiempo de verificación en el orden de microsegundos ($0.74\;\mu$s).
  2. Elimina la dependencia de modelos estocásticos o heurísticas de riesgo continuo (como Patel, 2026).
  3. El uso de NLI y modelos de decaimiento continuo (como la curva FSRS de Suresh Kumar et al., 2026) se reserva para análisis fuera de línea.

---

## ADR-004: Alineación Estricta con OpenTelemetry GenAI SemConv v1.42.0
* **Estado:** Aceptado (Versión 1.0).
* **Contexto:** La interoperabilidad industrial de AgentArch depende de no reinventar protocolos propietarios de telemetría.
* **Decisión:** 
  1. Utilizar el namespace estándar `agentarch.*` montado sobre la jerarquía de 5 tramos: `session`, `agent_turn`, `memory_op`, `tool_call` y `conformance`.
  2. Reutilizar atributos oficiales de OpenTelemetry SemConv v1.42.0 (junio de 2026), empleando `gen_ai.provider.name` (que sustituye al obsoleto `gen_ai.system`) y `gen_ai.request.model`.
  3. Restringir todos los atributos a primitivos escalares (`string`, `bool`, `int64`) o arreglos (`string[]`), serializando argumentos JSON en `agentarch.tool.args`.
* **Justificación:** Compatibilidad nativa con colectores OTel, Jaeger, Prometheus y plataformas industriales de trazabilidad distribuida.

---

## ADR-005: Reglas de Precedencia Causal ($\Pi_3$) frente a LTL/SMT en la v1
* **Estado:** Aceptado (Versión 1.0).
* **Contexto:** La coordinación entre agentes exige que ciertas operaciones no ocurran sin que se hayan completado satisfactoriamente sus prerrequisitos (e.g., verificar inventario antes de despachar stock). Motores formales pesados (como solucionadores SMT Z3 o autómatas LTL completos) incurren en sobrecarga temporal elevada en ejecución continua.
* **Decisión:** Modelar las dependencias operacionales como pares causales explícitos $(A, B)$ evaluados sobre el historial de eventos completados en la sesión. La síntesis automática de fórmulas LTL complejas y el model checking probabilístico (como PRISM en Pro2Guard) se difieren a trabajo futuro.
* **Justificación:** Verificación determinista instantánea en $O(1)$ amortizado mediante búsqueda en tablas hash de eventos completados.
