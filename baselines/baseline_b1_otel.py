"""Línea Base B1 (Python): Observabilidad Pasiva Estándar OpenTelemetry."""

import time
from typing import Dict, Any, List

def evaluate_b1(scenario: Dict[str, Any]) -> Dict[str, Any]:
    t0 = time.perf_counter()
    detected = False
    first_step = None
    violation = None

    for span in scenario.get("spans", []):
        attrs = span.get("attr", {}) or span.get("attributes", {})
        if attrs.get("http.status_code", 200) >= 500:
            detected = True
            first_step = span.get("step", 1)
            violation = "HTTP_500_ERROR"
            break

    elapsed_us = (time.perf_counter() - t0) * 1_000_000
    return {
        "detected": detected,
        "first_step": first_step,
        "violation": violation,
        "elapsed_us": elapsed_us
    }
