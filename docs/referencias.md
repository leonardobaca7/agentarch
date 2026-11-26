# Bibliografía del artículo

La edición compacta contiene 25 referencias, numeradas según su primera aparición en el texto: veinte trabajos de investigación y cinco fuentes de instrumentación, modelos y servidor. Cada cita acompaña a la afirmación que utiliza la fuente. Las descripciones de implementación y los resultados propios se apoyan en los registros del artefacto.

La revisión bibliográfica es narrativa. Los datos editoriales se conservan en [reference_audit.csv](../paper/reference_audit.csv) y el texto IEEE en [referencias.tex](../paper/referencias.tex). La selección conserva arquitectura, verificación, observabilidad, memoria y los componentes concretos del experimento.

## Fuentes por orden de cita

| N.º | Trabajo o componente | Fuente editorial o primaria |
| --- | --- | --- |
| 1 | What do we architect when we architect LLM agent systems? | [Registro](https://doi.org/10.1145/3774748.3795870) |
| 2 | Bridging MDE and LLM-based agent frameworks for multi-agent systems: A quasi-systematic review and metamodel | [Registro](https://doi.org/10.5220/0014236700004058) |
| 3 | Agent design pattern catalogue: A collection of architectural patterns for foundation model based agents | [Registro](https://doi.org/10.48550/arXiv.2405.10467) |
| 4 | Detecting architectural drift in safety-critical firmware through runtime trace analysis | [Registro](https://doi.org/10.48550/arXiv.2607.03135) |
| 5 | Conformance checking of processes based on monitoring real behavior | [Registro](https://doi.org/10.1016/j.is.2007.07.001) |
| 6 | Introduction to runtime verification | [Registro](https://doi.org/10.1007/978-3-319-75632-5_1) |
| 7 | A trace-based assurance framework for agentic AI orchestration: Contracts, testing, and governance | [Registro](https://doi.org/10.48550/arXiv.2603.18096) |
| 8 | AgentSpec: Customizable runtime enforcement for safe and reliable LLM agents | [Registro](https://doi.org/10.1145/3744916.3764546) |
| 9 | Runtime policy enforcement for MCP-based LLM agents | [Registro](https://doi.org/10.3390/electronics15132829) |
| 10 | MENTOR: Procedural shielding of tool-using LLM agents | [Registro](https://doi.org/10.48550/arXiv.2610.17039) |
| 11 | TraceFix: Repairing agent coordination protocols with TLA+ counterexamples | [Registro](https://doi.org/10.1145/3786335.3813159) |
| 12 | AgentOps: Enabling observability of LLM agents | [Registro](https://doi.org/10.48550/arXiv.2411.05285) |
| 13 | AgentTelemetry: A fault detection benchmark and toolkit for LLM agent observability | [Registro](https://doi.org/10.1145/3805760.3814931) |
| 14 | Observability and fault injection for LLM-based multi-agent systems in software engineering | [Registro](https://doi.org/10.1109/ICST69053.2026.00037) |
| 15 | COMPASS: A process mining-based methodology for prompt analysis of large language model agents | [Registro](https://ceur-ws.org/Vol-3996/paper-5.pdf) |
| 16 | Prompting in the wild: An empirical study of prompt evolution in software repositories | [Registro](https://doi.org/10.1109/MSR66628.2025.00106) |
| 17 | ClawVM: Harness-managed virtual memory for stateful tool-using LLM agents | [Registro](https://doi.org/10.1145/3805621.3807648) |
| 18 | When not to write memory: Governing false promotion from correlated agent traces | [Registro](https://doi.org/10.48550/arXiv.2607.02579) |
| 19 | MemArchitect: A policy driven memory governance layer | [Registro](https://doi.org/10.48550/arXiv.2603.18330) |
| 20 | AgentArch: A benchmark for evaluating agent architectures in enterprise workflows | [Registro](https://doi.org/10.18653/2026.aacl-long.44) |
| 21 | OpenTelemetry JavaScript instrumentation | [Registro](https://opentelemetry.io/docs/languages/js/instrumentation/) |
| 22 | GenAI semantic conventions | [Registro](https://github.com/open-telemetry/semantic-conventions-genai/tree/main/docs/gen-ai) |
| 23 | Qwen3-0.6B-GGUF | [Registro](https://huggingface.co/Qwen/Qwen3-0.6B-GGUF) |
| 24 | llama.cpp | [Registro](https://github.com/ggml-org/llama.cpp/releases/tag/b12704) |
| 25 | Qwen3-1.7B-GGUF | [Registro](https://huggingface.co/Qwen/Qwen3-1.7B-GGUF) |

## Precisiones editoriales

- Miranda et al.: MODELSWARD corresponde a *Model-Based Software and Systems Engineering*, pp. 33–44, según SciTePress.
- ClawVM: pp. 1–12, DOI `10.1145/3805621.3807648`, conforme al depósito de ACM en Crossref.
- GovMem: se cita la versión arXiv:2607.02579v1 de *When Not to Write Memory*. La aceptación indicada en la ficha no se convierte en páginas de actas no verificadas.
- El benchmark empresarial AgentArch se distingue del monitor de este repositorio. ACL Anthology informa pp. 915–933 y DOI `10.18653/2026.aacl-long.44`; no se añade `v1/` al identificador publicado.
- Las convenciones GenAI remiten al repositorio oficial `open-telemetry/semantic-conventions-genai`, directorio `docs/gen-ai`. Los atributos propios del monitor siguen siendo extensiones.
- Los metadatos de Rozinat y van der Aalst corresponden a *Information Systems* 33(1), pp. 64–95, 2008. El capítulo de Bartocci et al. corresponde a LNCS 10457, pp. 1–33, 2018.

Las fechas de consulta se mantienen en cada entrada. Los metadatos editoriales conservados están en [reference_metadata.json](../results/human_review/reference_metadata.json). Reducir la bibliografía no modifica los registros experimentales ni atribuye publicación revisada a un preprint.
