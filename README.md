# AgentArch: Runtime Architectural Drift Detection in LLM Multi-Agent Systems

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-SemConv_v1.42.0-orange.svg)](https://opentelemetry.io/)
[![Format](https://img.shields.io/badge/IEEE-IEEEtran_Conference-red.svg)](latex/conference_101719.tex)

Official reference implementation, experimental evaluation artifacts, and LaTeX source for the paper:

> **"Detección de Deriva Arquitectónica en Sistemas Multi-Agente Basados en Modelos de Lenguaje mediante Chequeo de Conformidad sobre Trazas"**  
> *Leonardo Baca Calsin & German Arturo Chipana Jeronimo*  
> Departamento de Ingeniería de Sistemas e Informática, Universidad Nacional de San Agustín de Arequipa (UNSA), Arequipa, Perú.

---

## 📌 Overview / Resumen

Large Language Model (LLM) Multi-Agent Systems (MAS) present a paradigm shift in software engineering, orchestrating complex workflows through specialized cognitive agents. Unlike traditional software with rigid imperative call graphs, MAS architectures suffer from **architectural drift**: the runtime divergence between the intended design specification and realized execution behavior, driven by prompt mutations, memory corruption, and precedence inversions.

**AgentArch** addresses this challenge through a formal, deterministic runtime conformance checking framework:
1. **Behavior Space Formulation:** Formally models agent behavior as the tuple $B = \langle P, M, \Pi \rangle$, encompassing cryptographically hashed prompt clauses ($P$), deterministic non-destructive memory states ($M$), and operational tool precedence rules ($\Pi$).
2. **Taxonomy of 9 Drift Operators:** Categorizes violations across $P_1\text{--}P_3$ (prompt suppression, conflict, tampering), $M_1\text{--}M_3$ (unverified admission, destructive overwrite, stale read), and $\Pi_1\text{--}\Pi_3$ (unauthorized tool, argument bound violation, precedence inversion).
3. **OpenTelemetry Telemetry Extension (`agentarch.*`):** A unified span hierarchy and primitive-typed attribute schema fully compliant with OpenTelemetry GenAI Semantic Conventions v1.42.0.
4. **Non-Blocking Streaming SpanProcessor:** Intercepts spans at `on_end(span)` and asynchronously routes violations to an audit queue $\mathcal{Q}_{\text{audit}}$ with negligible latency ($\approx 1.65\;\mu$s).

---

## 🔬 Experimental Evaluation (50 Scenarios)

We evaluate AgentArch against two baselines over a controlled suite of 50 ground-truth annotated scenarios in an e-commerce Customer Order Support agent system (`OrderTriage`, `InventoryAgent`, `BillingAgent`):
* **Baseline $B_1$ (Passive OpenTelemetry):** Standard distributed HTTP/RPC tracing without formal behavioral invariants.
* **Baseline $B_2$ (AgentSpec-style boundary rules):** Trigger-predicate tool filters based on static capability interfaces.
* **Proposed $B_{\text{prop}}$ (\textsc{AgentArch}):** Full behavior space conformance checker.

### 📊 Results Matrix

| Configuration | Nominal (10 esc.)<br>FPR (%) | Prompt (12 esc.)<br>Recall / F1 (%) | Memory (14 esc.)<br>Recall / F1 (%) | Policy (14 esc.)<br>Recall / F1 (%) | Global Precision | Global Recall | Global $F_1$-Score | Step Loc. ($t^*$ Acc) | Mean Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **$B_1$ (Passive OTel)** | 0.0% | 0.0% / 0.0% | 0.0% / 0.0% | 0.0% / 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | $2.60\;\mu$s |
| **$B_2$ (AgentSpec)** | 0.0% | 0.0% / 0.0% | 0.0% / 0.0% | 71.4% / 83.3% | 100.0% | 25.0% | 40.0% | 25.0% | $30.97\;\mu$s |
| **$B_{\text{prop}}$ (\textsc{AgentArch})** | **0.0%** | **100.0% / 100.0%** | **100.0% / 100.0%** | **100.0% / 100.0%** | **100.0%** | **100.0%** | **100.0%** | **100.0%** | **$38.14\;\mu$s** |

### ⏱️ Latency Microbenchmarking ($N=50,000$ iterations)

| Span Type | Evaluated Operators | Mean Latency ($\mu$s) | Std. Dev. ($\mu$s) |
| :--- | :--- | :---: | :---: |
| `agentarch.agent_turn` | $P_1, P_2, P_3$ (Prompt clauses / SHA-256) | 2.64 | $\pm 0.12$ |
| `agentarch.memory_op` | $M_1, M_2, M_3$ (Admission, Overwrite, TTL) | 0.74 | $\pm 0.05$ |
| `agentarch.tool_call` | $\Pi_1, \Pi_2, \Pi_3$ (Capabilities, Bounds, Order) | 1.58 | $\pm 0.08$ |
| **Weighted Average** | **Full verification cycle per span** | **1.65** | $\mathbf{\pm 0.08}$ |

---

## 🚀 Quick Start & Reproducibility

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher; tested on v22.16.0).

### Run the Evaluation Suite
Clone this repository and execute the evaluation runner:
```bash
git clone https://github.com/leonardobaca7/agentarch.git
cd agentarch
node eval_experiment.js
```

This will run all 50 scenarios against $B_1$, $B_2$, and $B_{\text{prop}}$, compute all metrics, and print the detailed latency breakdown.

---

## 📁 Repository Structure

```text
agentarch/
├── eval_experiment.js         # Complete evaluation harness, 50 scenarios & benchmarks
├── checklist_revision.md      # Literature audit trail and PDF contrast verifications
├── notas_lectura.md           # Canonical terminology glossary (Spanish/English)
├── latex/
│   ├── conference_101719.tex  # Full IEEEtran paper source in academic Spanish with TikZ
│   └── references.bib         # 26 verified bibliographic primary references
├── .gitignore                 # LaTeX and OS ignore patterns
└── README.md                  # Project overview, reproducibility guide & benchmarks
```

---

## 📝 Taxonomy of 9 Drift Operators

| Op. | Name | Span Type | Formal Violation Condition |
| :--- | :--- | :--- | :--- |
| $P_1$ | Mandatory Clause Suppression | `agentarch.agent_turn` | $\exists r \in \mathcal{R}_i^{\text{req}} \text{ s.t. } r \notin \text{ids}(P_i)$ |
| $P_2$ | Conflicting Clause Injection | `agentarch.agent_turn` | $\exists c_1, c_2 \in \text{ids}(P_i) : (c_1, c_2) \in \mathcal{M}_{\text{conflict}}$ |
| $P_3$ | Unauthorized Clause Alteration| `agentarch.agent_turn` | $\exists \langle \text{id}, h \rangle \in P_i, \; \langle \text{id}, h^0 \rangle \in P_i^0 : h \neq h^0$ |
| $M_1$ | Unverified Memory Admission | `agentarch.memory_op` | $(\text{op} = \text{write}) \wedge (\text{verified} = \text{false})$ |
| $M_2$ | Contradictory Destructive Write| `agentarch.memory_op` | $(\text{op} = \text{write}) \wedge (k \in \mathcal{K}) \wedge (v' \neq \mathcal{K}[k]) \wedge \neg \text{auth}$ |
| $M_3$ | Stale Read (TTL Expiration) | `agentarch.memory_op` | $(\text{op} = \text{read}) \wedge (t_{\text{now}} - t_k > \text{TTL}_k)$ |
| $\Pi_1$| Unauthorized Tool Invocation | `agentarch.tool_call` | $\exists (t, \mathbf{args}) \text{ s.t. } t \notin K_i$ |
| $\Pi_2$| Argument Schema/Bound Violation|`agentarch.tool_call` | $\exists x \in \mathbf{args} : \neg \text{SchemaCheck}(t, x)$ |
| $\Pi_3$| Precedence Inversion | `agentarch.tool_call` | $\exists e_t = B \in \tau : \forall t' < t, \; e_{t'} \neq A$ |

---

## 👥 Authors

* **Leonardo Baca Calsin** (`lbacac@unsa.edu.pe`)  
  *Universidad Nacional de San Agustín de Arequipa (UNSA)*, Arequipa, Perú.
* **German Arturo Chipana Jeronimo** (`gchipanaj@unsa.edu.pe`)  
  *Universidad Nacional de San Agustín de Arequipa (UNSA)*, Arequipa, Perú.

---

## 📜 Citation

```bibtex
@inproceedings{baca2026agentarch,
  author    = {Baca Calsin, Leonardo and Chipana Jeronimo, German Arturo},
  title     = {Detecci{\'o}n de Deriva Arquitect{\'o}nica en Sistemas Multi-Agente Basados en Modelos de Lenguaje mediante Chequeo de Conformidad sobre Trazas},
  booktitle = {Actas del Congreso de Ingenier{\'i}a de Software},
  year      = {2026}
}
```
