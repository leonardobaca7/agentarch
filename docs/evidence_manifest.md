# Índice de evidencias de la auditoría final

Versión prevista: v0.6.0-final-audit. Este índice está enlazado desde el PDF y reúne
registros comprobables sin atribuir una evaluación independiente a terceros.
El trabajo y la revisión humana corresponden a sus dos autores.

## Referencias y licencia

- [Fuentes editoriales contrastadas](verificacion_fuentes_consolidada.md): DOI de
  ACL Anthology sin v1/, páginas, foro de MODELSWARD, versión arXiv de GovMem y
  repositorio oficial de convenciones GenAI, con enlaces primarios.
- [Metadatos editoriales de Crossref](../results/human_review/reference_metadata.json):
  DOI, editor, páginas y título de los tres registros cuestionados.
- [Comprobación de GitHub del 26 de noviembre](../results/final_audit/github_license.json):
  identificador SPDX MIT y blob del archivo LICENSE.
- [LICENSE](../LICENSE): texto de licencia del artefacto.

## Revisión realizada por los autores

- [Formulario de Leonardo](../results/consolidated_analysis/revision_Leonardo.csv).
- [Formulario de German](../results/consolidated_analysis/revision_German.csv).
- [Consenso original](../results/consolidated_analysis/consenso_revision.csv).
- [Acuerdo inicial, consenso y SHA-256](../results/human_review/analysis.json).
- [Interpretación y aclaración de la remisión III-B/III-C](resultados_revision_autores.md).
- [.gitattributes](../.gitattributes): los tres CSV tienen el atributo text desactivado
  para conservar sus bytes entre plataformas.

Se verificó que los SHA-256 originales coinciden con los archivos actuales. La fila
W04-R1 del consenso menciona III-C; la definición de M1 está en III-B del artículo.
Se conserva el texto entregado y se aclara la remisión, sin cambiar sus etiquetas.
Los formularios son evidencia aportada por los autores; no certifican revisión externa
ni cegamiento documentado.

## Consultas prospectivas

- [Protocolo del lote tipado](prospective_queries_protocol.md), fijado en 52eee33.
- [Datos y análisis del lote tipado](../results/prospective_queries/).
- [Operaciones y límites por operador del lote tipado](../results/final_audit/typed_scope.json).
- [Protocolo del esquema general](final_audit_protocol.md), fijado en a52165e antes de ejecutar.
- [Todos los intentos del esquema general](../results/free_queries/).
- [Comparación de interfaces y desglose por plantilla](../results/final_audit/query_interfaces.json).

Cada directorio conserva peticiones, respuestas, eventos, tramos, etiquetas y
resúmenes. Los errores se mantienen si se producen. Ningún caso se descarta ni se
repite por el resultado del monitor. Las condiciones se informan por separado.

## Manuscrito y verificaciones

- [Fuente IEEE](../paper/articulo.tex) y [PDF](../paper/articulo.pdf).
- [Comprobaciones de esta revisión](../results/final_audit/document_checks.json).
- [Respuesta a la auditoría final](respuesta_auditoria_final.md).

Los microbenchmarks y la sensibilidad a metadatos se mantienen como apéndices
del artículo. La inspección visual y los controles de citas comprueban presentación
y coherencia de los archivos; no amplían la validez experimental declarada.
