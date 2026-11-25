# Protocolo del piloto con un modelo en ejecución

## Alcance y versión

El piloto evaluó ocho solicitudes del dominio de pedidos, repetidas tres veces. Cada sesión asignó
un rol a Qwen3-0.6B y ejecutó el plan de herramientas que produjo en funciones locales de prueba.
El código utilizado es el commit 647f45f2a0a12b3df4ef8e35ccb4809cc35e695b.
Los archivos de results/live_pilot conservan las salidas obtenidas el 24 de noviembre de 2026.

La inferencia se ejecutó realmente en el equipo. Las herramientas guardan argumentos en memoria
y registran su resultado en el tramo. Las operaciones financieras y de inventario representan
servicios de prueba. El piloto evalúa herramientas y precedencia. Los nueve operadores completos
se ejercitan en la evaluación guionizada de 50 escenarios.

## Modelo y equipo

- Pesos oficiales de https://huggingface.co/Qwen/Qwen3-0.6B-GGUF
- Archivo Qwen3-0.6B-Q8_0.gguf, 639446688 bytes
- SHA-256 9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031
- llama.cpp b12704, commit 72cda4a22, compilación CPU x64
- Intel Core i7-1165G7, 16 GB RAM, Windows x64
- Cuatro hilos, contexto de 4096 tokens, una ranura de ejecución, GPU desactivada
- Node.js 22.15.0, OpenTelemetry SDK 2.12.1 y API 1.9.0
- Temperatura 0, semillas 42, 43 y 44, límite de 512 tokens
- Respuesta JSON y opción enable_thinking=false
- Máximo de 12 llamadas por plan; rechazo o plan vacío se cuentan explícitamente

## Reproducción de una nueva ejecución

Instalar las dependencias fijadas con npm ci. Obtener los pesos y verificar su SHA-256.
Iniciar el ejecutable oficial de llama.cpp en una terminal.

~~~powershell
llama-server.exe -m Qwen3-0.6B-Q8_0.gguf --host 127.0.0.1 --port 18080 -c 4096 -t 4 -ngl 0 --parallel 1 --alias Qwen3-0.6B-Q8_0
~~~

Desde la raíz del repositorio, en otra terminal, ejecutar el piloto sobre un directorio nuevo.

~~~powershell
$env:LLM_ENDPOINT = 'http://127.0.0.1:18080/v1'
$env:LLM_MODEL = 'Qwen3-0.6B-Q8_0'
$env:MODEL_SHA256 = '9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031'
$env:LIVE_OUTPUT = 'results/live_new_run'
$env:LIVE_REPEATS = '3'
node experiments/run_live_evaluation.js
node experiments/verify_live_artifacts.js results/live_new_run
~~~

El verificador de artefactos comprueba respuestas, trazas, operadores y métricas y regenera la tabla
del piloto para el manuscrito. Los fallos de red, HTTP o formato quedan registrados y provocan
un código de salida de error. El ejecutor exige un directorio nuevo para preservar la evidencia previa.

## Etiquetado

live_cases.json fija las solicitudes nominales y adversariales. El oráculo labelCalls del ejecutor
etiqueta las llamadas efectivamente generadas. Consulta permisos, rangos y precedencias mediante
una implementación separada del verificador y no utiliza sus alertas. Una petición adversarial que
el modelo rechace o corrija puede dar una sesión conforme.

Un turno es el paso 1 y la primera herramienta es el paso 2. Las llamadas se ejecutan
secuencialmente. Cada sesión obtiene un traceId del SDK. El adaptador del monitor conserva su
estado por traceId y lo libera al finalizar la sesión. Las pruebas intercalan dos sesiones y
comprueban que una consulta de inventario en una sesión no habilite una reserva en la otra.

## Archivos y comprobación

requests.jsonl guarda los mensajes y respuestas HTTP completas.
spans.jsonl guarda los 78 tramos producidos por el SDK.
records.jsonl guarda planes, etiquetas y resultados por sesión.
audit.jsonl contiene las alertas de AgentArch.
metadata.json registra parámetros, equipo, commit y hash de los pesos.
summary.json contiene los conteos y tiempos de la ejecución.
runtime.json identifica el servidor, el archivo y la configuración usada.

~~~powershell
node tests/test_drift_operators.js
node tests/test_live_integration.js
node experiments/verify_live_artifacts.js
node experiments/instrumentation_sensitivity.js
~~~

Las 24 respuestas terminaron normalmente y produjeron planes válidos. Hubo 12 sesiones conformes
y 12 con infracciones. Las tres repeticiones de cada solicitud dieron el mismo plan, de modo que
la diversidad efectiva es de ocho planes. AgentArch detectó las 12 sesiones con infracciones y
localizó su primer paso. No emitió alertas en las otras 12. B1 detectó cero y B2 detectó seis.

El muestreo conserva un modelo, cuatro solicitudes nominales y cuatro adversariales, repetidas.
Estas repeticiones no constituyen 24 situaciones independientes. El artefacto permite inspeccionar
las respuestas y contrastar las etiquetas, con los límites propios de un piloto.

## Costos y supuestos

El microbenchmark de noviembre de 2026 mide únicamente el núcleo conforme. Su CSV y JSON
originales se conservan y el artículo identifica su commit. Los tiempos del piloto incluyen
turno e instrumentación local. No permiten calcular por sí solos la sobrecarga incremental de
una integración completa. Para ello se requieren ejecuciones emparejadas con y sin monitor.

instrumentation_sensitivity.js documenta por separado cuatro casos de metadatos. Un hash fiel
a un prompt alterado permite detectar P3; un hash canónico incorrectamente conservado oculta el
cambio. Una escritura sin respaldo dispara M1 si verified=false y se omite si se informa
incorrectamente verified=true. La confianza en la instrumentación debe evaluarse en cada integración.
