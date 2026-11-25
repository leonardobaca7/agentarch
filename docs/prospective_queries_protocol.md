# Lote prospectivo de consultas benignas

Se fija antes de inferir un lote de 30 sesiones: diez plantillas de petición y tres
variantes de pedido, producto y cantidad por plantilla. Se ejecutará una muestra
por caso, con Qwen3-0.6B-Q8_0, temperatura 0,7 y semillas 200–229. Se conservarán
todos los intentos, errores y alertas. No se seleccionarán, descartarán ni repetirán
sesiones según el resultado del monitor o el anotador. No se modificarán los pesos.

Cada sesión utiliza los tres roles originales y transfiere mensajes, resultados y
memoria. Se cambia la interfaz ANTES de generar: cada rol dispone de una consulta
con argumentos tipados (lookup_order, verify_inventory o calculate_refund), no hay
escrituras de memoria ni acciones de reserva o pago. Las lecturas se limitan a la
dirección inicial vigente. Los argumentos y mensajes los genera el modelo; no se
sustituyen por planes escritos a mano ni se corrigen después de recibirlos.

Los esquemas garantizan permisos y tipos/rangos de argumentos; no fijan la identidad
del pedido o producto ni obligan a que el importe cotizado sea cero. Los servicios
rechazan identidades incorrectas y el criterio de tarea comprueba efectos reales.
El monitor es pasivo y sus alertas no se incluyen en los prompts.

Esta condición favorece conformidad por construcción de la interfaz y no equivale
a un agente con acciones libres. Evalúa posibles alertas espurias sobre consultas
tipadas del dominio local. No prueba cobertura de las nueve infracciones, ni permite
mezclar sus negativos con los tres del experimento libre para estimar una tasa
poblacional. Las treinta sesiones están agrupadas en diez plantillas, con tres
variaciones de datos cada una; se informará esa dependencia y el desglose completo.

El análisis contrastará peticiones, respuestas, acciones, tramos, etiquetas y estado
final. Se publicarán todos los casos, finalización, alertas y conteos por plantilla.
La revisión humana de diez sesiones del estudio anterior se analizará por separado.

```powershell
$env:WORKFLOW_CASE_SET = 'benign_queries'
$env:WORKFLOW_REPEATS = '1'
$env:WORKFLOW_SEED_BASE = '200'
$env:WORKFLOW_TEMPERATURE = '0.7'
$env:WORKFLOW_OUTPUT = 'results/prospective_queries'
node experiments/run_multiagent_evaluation.js
$env:WORKFLOW_ASSET_DIR = 'results/prospective_queries/tables'
node experiments/analyze_multiagent.js results/prospective_queries
```

Se mantienen el servidor llama.cpp b12704, contexto 8192, cuatro hilos de CPU,
una ranura y cero capas GPU. El modelo y su SHA-256 corresponden al piloto previo.
Una reproducción debe usar un directorio nuevo y conservar las observaciones previas.
