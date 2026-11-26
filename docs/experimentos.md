# Diseño experimental y reproducción

La evaluación publicada combina escenarios controlados, inferencia local, controles de acciones, revisión de sesiones y microbenchmarks. Las cohortes, las peticiones y los resultados se conservan por separado. Los scripts rechazan reutilizar un directorio que ya contiene peticiones del flujo con modelo.

## Entorno

Windows x64, Intel Core i7-1165G7, 16 GB de RAM, Node.js 22.15.0, OpenTelemetry SDK 2.12.1 y llama.cpp b12704 (commit 72cda4a22). La inferencia utiliza cuatro hilos de CPU, GPU desactivada y hasta 512 tokens de salida. El piloto usa contexto 4096; los flujos de tres roles, 8192.

| Modelo Q8_0 | Tamaño en bytes | SHA-256 |
| --- | ---: | --- |
| Qwen3-0.6B | 639446688 | `9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031` |
| Qwen3-1.7B | 1834426016 | `061b54daade076b5d3362dac252678d17da8c68f07560be70818cace6590cb1a` |

Los metadatos de cada directorio registran versión, modelo y configuración efectivos. Los hashes identifican los pesos concretos; no se sustituyen por el nombre comercial del modelo.

## Conjuntos

| Conjunto | Configuración | Datos |
| --- | --- | --- |
| Guionizado | 50 trazas: 10 nominales y 40 infractoras; 10 patrones con repeticiones | [Resultados](../results/summary_metrics.json) |
| Piloto por rol | 8 solicitudes × 3 repeticiones, temperatura 0, semillas 42–44 | [Registros](../results/live_pilot/) |
| Pedidos 0.6B | 12 solicitudes × 5 muestras, temperatura 0,7, semillas 100–104 | [Registros](../results/multiagent_run/) |
| Pedidos 1.7B | Las mismas 12 solicitudes, una muestra, temperatura 0,7, semilla 100 | [Registros](../results/larger_model/) |
| Control escrito a mano | 12 trayectorias completas por el mismo ejecutor, sin inferencia | [Registros](../results/positive_control/) |
| Consulta tipada | 10 plantillas × 3 variantes, temperatura 0,7, semillas 200–229 | [Registros](../results/prospective_queries/) |
| Consulta general | Las mismas 30 entradas y semillas; esquema de acciones general | [Registros](../results/free_queries/) |

Las entradas principales incluyen seis solicitudes benignas y seis adversariales o perturbadas. W10 omite autenticación y W11 altera la garantía en el prompt enviado. El anotador evalúa las acciones con código separado y las mismas políticas del monitor. B1 detecta HTTP ≥ 500; B2 aplica permisos y validadores de argumentos inspirados en AgentSpec, sin ejecutar la implementación original de esa herramienta.

Las consultas tipadas restringen una herramienta por rol, tipos y rangos, y excluyen escrituras, reservas y pagos. El esquema general conserva instrucciones de consulta, pero admite hasta cuatro llamadas de nombre libre, dos escrituras y dos lecturas por rol. Los intentos se conservan completos, sin filtrarlos por el veredicto del monitor. Sus condiciones quedaron registradas antes de ejecutar en los commits `52eee33` y `a52165e`, respectivamente.

## Parámetros del ejecutor

`experiments/run_multiagent_evaluation.js` consume estas variables de entorno:

| Variable | Uso |
| --- | --- |
| `LLM_ENDPOINT` | URL base compatible con OpenAI, por defecto `http://127.0.0.1:18080/v1` |
| `WORKFLOW_OUTPUT` | Directorio nuevo para los resultados |
| `WORKFLOW_REPEATS` | Muestras por caso; 5 para pedidos principales, 1 para consultas y modelo mayor |
| `WORKFLOW_TEMPERATURE` | Temperatura; 0,7 en los flujos de tres roles |
| `WORKFLOW_SEED_BASE` | 100 para pedidos; 200 para consultas |
| `WORKFLOW_MODEL` | Identificador del modelo servido |
| `WORKFLOW_MODEL_SHA256` | Hash verificado de los pesos |
| `WORKFLOW_CASE_SET` | Vacío para pedidos, `benign_queries` para consulta tipada, `free_queries` para general |
| `WORKFLOW_CONTROL` | `positive` selecciona acciones escritas a mano |
| `WORKFLOW_CASE_IDS` | Selección explícita por identificador cuando corresponde |

Ejemplo PowerShell para repetir el lote principal sin sobrescribirlo, con el servidor ya disponible:

```powershell
$env:WORKFLOW_OUTPUT = 'results/reproduction_orders'
$env:WORKFLOW_REPEATS = '5'
$env:WORKFLOW_TEMPERATURE = '0.7'
$env:WORKFLOW_SEED_BASE = '100'
$env:WORKFLOW_MODEL = 'Qwen3-0.6B-Q8_0'
$env:WORKFLOW_MODEL_SHA256 = '9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031'
node experiments/run_multiagent_evaluation.js
```

Los scripts `analyze_multiagent.js`, `analyze_exclusions.js`, `analyze_queries.js` y `analyze_human_review.py` calculan desgloses a partir de los registros. Sus rutas de salida están definidas en el código; ejecutarlos puede regenerar resúmenes. `npm run paper:assets` solo lee resultados y escribe las cuatro tablas compactas del manuscrito.

## Métricas y tiempos

VP, FP, VN y FN se calculan por sesión. El primer paso se divide entre todas las sesiones infractoras, incluidas las omitidas. La exhaustividad, F1 y localización son indefinidas sin positivos. La finalización se calcula mediante los efectos del dominio, no por los mensajes del modelo.

Los microbenchmarks ampliados usan 100 lotes de 1000 llamadas, con 1000 de calentamiento y un procesador nuevo por lote. R7 interpola percentiles de las medias por lote. En el núcleo, comprobar y drenar la cola queda fuera del intervalo; en el adaptador, el drenaje está dentro. Este último recibe objetos con forma de `ReadableSpan`, sin medir creación ni exportación SDK. Los ejecutores son `benchmark_paths.js` y `benchmark_supplement.js`; los datos están en [latency_paths](../results/latency_paths/) y [latency_supplement](../results/latency_supplement/).

El ensayo histórico de 50 lotes se conserva aparte. Ambos ensayos calentaron sus lotes; no son un diseño emparejado para atribuir diferencias a una optimización. Los percentiles no describen llamadas individuales ni latencia de inferencia.
