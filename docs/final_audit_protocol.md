# Protocolo previo de consultas con esquema de acciones libre

Fecha: 26 de noviembre de 2026. Se ejecutarán las treinta solicitudes Q01–Q30 ya
publicadas, sin escogerlas por sus resultados individuales: diez plantillas y tres
variantes de datos. Se mantiene Qwen3-0.6B-Q8_0, temperatura 0,7, semillas 200–229,
contexto 8192, 512 tokens máximos por turno y el servidor llama.cpp b12704 en CPU.

Se conserva la instrucción de consultar y no escribir ni efectuar transacciones,
igual que en el lote tipado. CAMBIA el esquema de generación: se usa el esquema
general del estudio original, que permite hasta cuatro llamadas con nombre libre
y argumentos de objeto, dos escrituras y dos lecturas por rol. El esquema no
impide herramientas fuera del rol, argumentos inválidos, escrituras sin respaldo,
reservas ni pagos. Los intentos se registran incluso si el servicio los rechaza.
El monitor sigue siendo pasivo; no corrige ni filtra los planes.

Los tres roles y sus mensajes, resultados y memoria se mantienen. No se sustituye
ninguna salida por un plan manual. Se conservarán todos los intentos y errores,
sin repetir ni eliminar según las alertas. El análisis separará sesiones conformes,
infractoras y tareas completas. Si no aparecen conformes, se informará ese resultado.

La comparación es descriptiva entre dos interfaces sobre las mismas solicitudes
y semillas, ejecutadas en momentos distintos. No prueba causalidad ni una tasa
poblacional de falsos positivos. Las variantes están agrupadas en diez plantillas.
El ámbito es consulta de pedidos; no sustituye experimentos abiertos de reserva y
pago. La anotación del lote nuevo es automática, separada de los diez casos que
revisaron los autores. No se exige ni se atribuye una validación por terceros.

```powershell
$env:WORKFLOW_CASE_SET = 'free_queries'
$env:WORKFLOW_REPEATS = '1'
$env:WORKFLOW_SEED_BASE = '200'
$env:WORKFLOW_TEMPERATURE = '0.7'
$env:WORKFLOW_OUTPUT = 'results/free_queries'
node experiments/run_multiagent_evaluation.js
$env:WORKFLOW_ASSET_DIR = 'results/free_queries/tables'
node experiments/analyze_multiagent.js results/free_queries
```

El directorio de salida debe ser nuevo. Se verificará el SHA-256 ya publicado de
los pesos antes de iniciar el servidor. La fuente y este protocolo se fijan en un
commit antes de ejecutar. Los originales de la revisión humana permanecen intactos.
