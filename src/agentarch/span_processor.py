"""Algoritmo 2: Monitor pasivo en streaming (AgentArchSpanProcessor)."""

import json
from typing import Dict, Any, List
from .models import Span, AuditEvent, ConformanceStatus
from .audit_queue import AuditQueue
from .rules_p import evaluate_p1, evaluate_p2, evaluate_p3
from .rules_m import evaluate_m1, evaluate_m2, evaluate_m3
from .rules_pi import evaluate_pi1, evaluate_pi2, evaluate_pi3

class AgentArchSpanProcessor:
    """Implementación de OpenTelemetry SpanProcessor para verificación de conformidad."""
    def __init__(self, spec: Dict[str, Any], audit_queue: AuditQueue):
        self.spec = spec
        self.audit_queue = audit_queue
        self.mem_store: Dict[str, Any] = {}
        self.completed_tools = set()

    def on_start(self, span: Span, parent_context: Any = None) -> None:
        """Gancho de inicio: no intrusivo."""
        pass

    def on_end(self, span: Span) -> None:
        """Gancho de finalización: evalúa invariantes y encola violaciones."""
        violations = []

        # Turno de agente (P1, P2, P3)
        if span.name == "agentarch.agent_turn":
            agent_id = span.attributes.get("agentarch.agent.id", "")
            active_ids = span.attributes.get("agentarch.prompt.active_clause_ids", [])
            active_hashes = span.attributes.get("agentarch.prompt.active_clause_hashes", [])
            active_dict = dict(zip(active_ids, active_hashes))

            agent_spec = self.spec.get("prompt_specification", {}).get("roles", {}).get(agent_id, {})
            required_ids = agent_spec.get("required_clause_ids", [])
            canonical_hashes = {k: v.get("sha256") for k, v in agent_spec.get("clauses", {}).items()}
            conflict_pairs = [c.get("pair") for c in self.spec.get("prompt_specification", {}).get("conflict_matrix", [])]

            violations.extend(evaluate_p1(active_ids, required_ids, agent_id))
            violations.extend(evaluate_p2(active_ids, conflict_pairs, agent_id))
            violations.extend(evaluate_p3(active_dict, canonical_hashes, agent_id))

        # Operaciones de memoria (M1, M2, M3)
        elif span.name == "agentarch.memory_op":
            op = span.attributes.get("agentarch.memory.op", "")
            key = span.attributes.get("agentarch.memory.key", "")

            if op == "write":
                verified = span.attributes.get("agentarch.memory.verified", False)
                new_val = span.attributes.get("agentarch.memory.new_value")
                auth = span.attributes.get("agentarch.memory.authorized_replacement", False)
                ts = span.attributes.get("agentarch.memory.timestamp", 0)
                ttl = span.attributes.get("agentarch.memory.ttl", 60000)

                violations.extend(evaluate_m1(verified, key))
                violations.extend(evaluate_m2(key, new_val, self.mem_store, auth))
                self.mem_store[key] = {"value": new_val, "timestamp": ts, "ttl": ttl}

            elif op == "read":
                ts_now = span.attributes.get("agentarch.memory.timestamp", 0)
                violations.extend(evaluate_m3(key, ts_now, self.mem_store))

        # Llamadas a herramientas (Pi1, Pi2, Pi3)
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

            violations.extend(evaluate_pi1(tool_name, allowed, agent_id))
            violations.extend(evaluate_pi2(tool_name, args, validator, agent_id))
            violations.extend(evaluate_pi3(tool_name, self.completed_tools, precedences, agent_id))
            self.completed_tools.add(tool_name)

        if violations:
            event = AuditEvent(
                trace_id=span.trace_id,
                span_id=span.span_id,
                timestamp=span.end_time or 0,
                status=ConformanceStatus.DRIFT_DETECTED,
                violations=violations
            )
            self.audit_queue.put(event)

    def shutdown(self) -> None:
        pass

    def force_flush(self, timeout_millis: int = 30000) -> bool:
        return True
