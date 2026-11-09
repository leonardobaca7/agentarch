"""Reglas de verificación de deriva de memoria (M1, M2, M3)."""

from typing import List, Dict, Any, Optional
from .models import Violation, DriftOperator

def evaluate_m1(verified: bool, key: str) -> List[Violation]:
    """M1: Violación de admisión (escritura sin soporte empírico verificado)."""
    violations = []
    if not verified:
        violations.append(Violation(
            operator=DriftOperator.M1_UNVERIFIED_ADMISSION,
            target=key,
            message=f"Intento de persistir memoria sin soporte empírico verificado en clave: {key}"
        ))
    return violations

def evaluate_m2(key: str, new_val: Any, mem_store: Dict[str, Any], auth_replacement: bool) -> List[Violation]:
    """M2: Sobrescritura determinista contradictoria sin autorización explícita."""
    violations = []
    if key in mem_store:
        existing_val = mem_store[key].get("value")
        if existing_val != new_val and not auth_replacement:
            violations.append(Violation(
                operator=DriftOperator.M2_DESTRUCTIVE_OVERWRITE,
                target=key,
                message=f"Sobrescritura destructiva/contradictoria no autorizada en clave: {key}"
            ))
    return violations

def evaluate_m3(key: str, current_timestamp: int, mem_store: Dict[str, Any]) -> List[Violation]:
    """M3: Lectura de registro caducado según TTL."""
    violations = []
    if key in mem_store:
        record = mem_store[key]
        created_at = record.get("timestamp", 0)
        ttl = record.get("ttl", 0)
        if ttl > 0 and (current_timestamp - created_at > ttl):
            violations.append(Violation(
                operator=DriftOperator.M3_STALE_READ,
                target=key,
                message=f"Lectura de memoria caducada: tiempo transcurrido ({current_timestamp - created_at} ms) excede TTL ({ttl} ms)"
            ))
    return violations
