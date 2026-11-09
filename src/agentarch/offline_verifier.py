"""Algoritmo 1: Verificador determinista fuera de línea sobre trazas consolidadas."""

import time
import json
from typing import Dict, Any, List
from .models import ConformanceReport, ConformanceStatus, Span
from .rules_p import evaluate_p1, evaluate_p2, evaluate_p3
from .rules_m import evaluate_m1, evaluate_m2, evaluate_m3
from .rules_pi import evaluate_pi1, evaluate_pi2, evaluate_pi3

class OfflineTraceVerifier:
    def __init__(self, spec: Dict[str, Any]):
        self.spec = spec

    def verify_trace(self, spans: List[Span]) -> ConformanceReport:
        t0 = time.perf_counter()
        mem_store = {}
        completed_tools = set()
        violations = []
        first_step = None

        for span in spans:
            step = span.step or 1
            span_viols = []

            # 1. Turno de agente (P1, P2, P3)
            if span.name == "agentarch.agent_turn":
                agent_id = span.attributes.get("agentarch.agent.id", "")
                active_ids = span.attributes.get("agentarch.prompt.active_clause_ids", [])
                active_hashes_list = span.attributes.get("agentarch.prompt.active_clause_hashes", [])
                active_dict = dict(zip(active_ids, active_hashes_list))

                agent_spec = self.spec.get("prompt_specification", {}).get("roles", {}).get(agent_id, {})
                required_ids = agent_spec.get("required_clause_ids", [])
                canonical_hashes = {k: v.get("sha256") for k, v in agent_spec.get("clauses", {}).items()}
                conflict_pairs = [c.get("pair") for c in self.spec.get("prompt_specification", {}).get("conflict_matrix", [])]

                span_viols.extend(evaluate_p1(active_ids, required_ids, agent_id))
                span_viols.extend(evaluate_p2(active_ids, conflict_pairs, agent_id))
                span_viols.extend(evaluate_p3(active_dict, canonical_hashes, agent_id))

            # 2. Operaciones de memoria (M1, M2, M3)
            elif span.name == "agentarch.memory_op":
                op = span.attributes.get("agentarch.memory.op", "")
                key = span.attributes.get("agentarch.memory.key", "")

                if op == "write":
                    verified = span.attributes.get("agentarch.memory.verified", False)
                    new_val = span.attributes.get("agentarch.memory.new_value")
                    auth_replace = span.attributes.get("agentarch.memory.authorized_replacement", False)
                    ts = span.attributes.get("agentarch.memory.timestamp", 0)
                    ttl = span.attributes.get("agentarch.memory.ttl", 60000)

                    span_viols.extend(evaluate_m1(verified, key))
                    span_viols.extend(evaluate_m2(key, new_val, mem_store, auth_replace))
                    mem_store[key] = {"value": new_val, "timestamp": ts, "ttl": ttl}

                elif op == "read":
                    ts_now = span.attributes.get("agentarch.memory.timestamp", 0)
                    span_viols.extend(evaluate_m3(key, ts_now, mem_store))

            # 3. Llamadas a herramientas (Pi1, Pi2, Pi3)
            elif span.name == "agentarch.tool_call":
                agent_id = span.attributes.get("agentarch.agent.id", "")
                tool_name = span.attributes.get("agentarch.tool.name", "")
                raw_args = span.attributes.get("agentarch.tool.args", "{}")
                try:
                    args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
                except Exception:
                    args = {}

                allowed = self.spec.get("policy_specification", {}).get("capabilities", {}).get(agent_id, [])
                validator = self.spec.get("validators", {}).get(tool_name)
                precedences = self.spec.get("policy_specification", {}).get("precedences", [])

                span_viols.extend(evaluate_pi1(tool_name, allowed, agent_id))
                span_viols.extend(evaluate_pi2(tool_name, args, validator, agent_id))
                span_viols.extend(evaluate_pi3(tool_name, completed_tools, precedences, agent_id))
                completed_tools.add(tool_name)

            for v in span_viols:
                v.step = step
                violations.append(v)
                if first_step is None:
                    first_step = step

        t1 = time.perf_counter()
        status = ConformanceStatus.DRIFT_DETECTED if violations else ConformanceStatus.CONFORMANT
        return ConformanceReport(
            status=status,
            violations=violations,
            first_violating_step=first_step,
            elapsed_us=(t1 - t0) * 1_000_000
        )
