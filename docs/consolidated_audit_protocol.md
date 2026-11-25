# Protocolo previo para la auditoría consolidada

Se conservan íntegramente las 60 sesiones de Qwen3-0.6B y todas las mediciones
anteriores. No se seleccionan ejecuciones por éxito ni se reintentan respuestas
para mejorar las métricas.

## Control del arnés

Doce planes escritos a mano, uno por solicitud, se ejecutarán con la misma
orquestación, servicios, memoria, captura del SDK y criterio de finalización que
los planes del modelo. Solo cambia la fuente del plan. Se espera completar las
doce tareas. W10/W11 conservarán los prompts perturbados y deberán activar P1/P3
aunque la tarea se complete. Los controles no cuentan como evidencia del modelo.
No se simulan respuestas HTTP: las entradas identifican expresamente su origen.

## Análisis por operadores

Se recalcularán etiquetas y alertas filtradas, con primer paso calculado de nuevo
en ambos lados: todas las reglas; sin M1; sin W10/W11; y ambas exclusiones. Se
informarán sesiones con infracción, sesiones conformes y pares operador/paso.
M1 representa 84 de 141 pares en el conjunto anterior. Estas exclusiones son un
análisis de sensibilidad de las trazas existentes, sin volver a ejecutar agentes.

## Modelo mayor

Se ejecutará Qwen3-1.7B-Q8_0 oficial, una muestra por cada una de las doce
solicitudes, temperatura 0,7 y semilla 100. Se mantienen prompts, tres roles,
cuantización Q8_0, servicios, límite de 512 tokens y contexto de 8192. Se comparará
descriptivamente con la primera muestra de las mismas doce solicitudes del modelo
0,6B; no con el total de 60 como si fueran tamaños comparables. No se presupone
que el modelo mayor produzca éxitos. Se conservarán errores y salidas completas.

Pesos previstos: Qwen/Qwen3-1.7B-GGUF, Qwen3-1.7B-Q8_0.gguf, 1 834 426 016 bytes,
SHA-256 061b54daade076b5d3362dac252678d17da8c68f07560be70818cace6590cb1a.
El servidor será llama.cpp b12704, CPU de cuatro hilos, una ranura y GPU desactivada.

## Tiempos complementarios

Tras detener la inferencia se medirán lecturas vigentes y expiradas y la llamada
del adaptador AgentArchOtelProcessor con turnos conformes y con alerta. Cada camino
usará cien lotes de mil llamadas y calentamiento. Se conservarán medias de lote y
estadísticos R7. En el adaptador se incluyen conversión, búsqueda de sesión,
comprobación, drenaje y callback; se excluyen creación de tramos por el SDK,
transporte y exportación. Esta medición no es costo extremo a extremo.

## Revisión de etiquetas

Se preparará una muestra reproducible de diez sesiones para los autores, incluyendo
los tres conformes y siete casos con infracciones. Los campos
de revisión humana permanecerán vacíos hasta que una persona real los complete.
La inspección asistida por IA se identificará como tal y no se atribuirá a humanos.

## Reproducción

Para el control: WORKFLOW_CONTROL=positive, WORKFLOW_REPEATS=1 y
WORKFLOW_OUTPUT=results/positive_control, mediante run_multiagent_evaluation.js.
Para el modelo mayor: WORKFLOW_MODEL=Qwen3-1.7B-Q8_0 y su SHA-256 en
WORKFLOW_MODEL_SHA256, WORKFLOW_REPEATS=1, WORKFLOW_TEMPERATURE=0.7,
WORKFLOW_OUTPUT=results/larger_model. Se usará LLM_ENDPOINT=http://127.0.0.1:18080/v1.
El análisis admite WORKFLOW_ASSET_DIR para mantener separadas las tablas auxiliares.

El límite de páginas no está establecido según los autores. Se mantiene IEEEtran.

### Comandos de análisis y ejecución

Desde la raíz del repositorio, el control no requiere un servidor:

```powershell
$env:WORKFLOW_CONTROL = 'positive'
$env:WORKFLOW_REPEATS = '1'
$env:WORKFLOW_OUTPUT = 'results/positive_control_new'
node experiments/run_multiagent_evaluation.js
$env:WORKFLOW_ASSET_DIR = 'results/positive_control_new/tables'
node experiments/analyze_multiagent.js results/positive_control_new
```

Para repetir el contraste del modelo mayor, iniciar antes llama-server b12704
con los pesos verificados, alias Qwen3-1.7B-Q8_0, puerto 18080, contexto 8192,
cuatro hilos, una ranura y cero capas GPU, igual que en el protocolo anterior.
Usar un directorio nuevo y quitar la selección del control:

```powershell
Remove-Item Env:WORKFLOW_CONTROL -ErrorAction SilentlyContinue
$env:WORKFLOW_MODEL = 'Qwen3-1.7B-Q8_0'
$env:WORKFLOW_MODEL_SHA256 = '061b54daade076b5d3362dac252678d17da8c68f07560be70818cace6590cb1a'
$env:WORKFLOW_REPEATS = '1'
$env:WORKFLOW_TEMPERATURE = '0.7'
$env:WORKFLOW_OUTPUT = 'results/larger_model_new'
node experiments/run_multiagent_evaluation.js
$env:WORKFLOW_ASSET_DIR = 'results/larger_model_new/tables'
node experiments/analyze_multiagent.js results/larger_model_new
```

Los siguientes análisis leen los directorios versionados, sin volver a inferir:

```powershell
node experiments/analyze_exclusions.js
node experiments/analyze_consolidated.js
```

El benchmark complementario se reproduce con
`node experiments/benchmark_supplement.js` después de detener la inferencia.
Su salida `results/latency_supplement` debe estar ausente; conservar la medición
anterior en otro directorio si se desea repetirla. No sustituir los datos
publicados sin identificar la nueva ejecución y regenerar sus tablas.
