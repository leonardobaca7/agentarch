"""Línea Base B2 (Python): Reglas de Políticas al Estilo AgentSpec."""

import time
import json
from typing import Dict, Any

def evaluate_b2(scenario: Dict[str, Any], spec: Dict[str, Any]) -> Dict[str, Any]:
    t0 = time.perf_counter()
    detected = False
    first_step = None
    violation = None

    for span in scenario.get("spans", []):
        if span.get("name") == "agentarch.tool_call":
            attrs = span.get("attr", {}) or span.get("attributes", {})
            agent_id = attrs.get("agentarch.agent.id")
            tool_name = attrs.get("agentarch.tool.name")
            raw_args = attrs.get("agentarch.tool.args", "{}")
            try:
                args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
            except Exception:
                args = {}

            # 1. Capacidades (Pi1)
            allowed = spec.get("policy_specification", {}).get("capabilities", {}).get(agent_id, [])
            if tool_name not in allowed:
                detected = True
                first_step = span.get("step", 1)
                violation = "Pi1"
                break

            # 2. Validación de límites y esquema (Pi2)
            validator = spec.get("validators", {}).get(tool_name)
            if validator and not validator(args):
                detected = True
                first_step = span.get("step", 1)
                violation = "Pi2"
                break

    elapsed_us = (time.perf_counter() - t0) * 1_000_000
    return {
        "detected": detected,
        "first_step": first_step,
        "violation": violation,
        "elapsed_us": elapsed_us
    }
