"""Reglas de verificación de deriva de prompts (P1, P2, P3)."""

from typing import List, Dict, Any, Tuple
from .models import Violation, DriftOperator

def evaluate_p1(active_clause_ids: List[str], required_clause_ids: List[str], agent_id: str) -> List[Violation]:
    """P1: Supresión de directiva obligatoria."""
    violations = []
    active_set = set(active_clause_ids)
    for req in required_clause_ids:
        if req not in active_set:
            violations.append(Violation(
                operator=DriftOperator.P1_MANDATORY_SUPPRESSION,
                target=agent_id,
                message=f"Falta directiva obligatoria de seguridad: {req}"
            ))
    return violations

def evaluate_p2(active_clause_ids: List[str], conflict_matrix: List[Tuple[str, str]], agent_id: str) -> List[Violation]:
    """P2: Inyección de cláusulas contradictorias."""
    violations = []
    active_set = set(active_clause_ids)
    for c1, c2 in conflict_matrix:
        if c1 in active_set and c2 in active_set:
            violations.append(Violation(
                operator=DriftOperator.P2_CONFLICTING_INJECTION,
                target=agent_id,
                message=f"Conflicto entre cláusulas incompatibles: {c1} y {c2}"
            ))
    return violations

def evaluate_p3(active_clauses: Dict[str, str], canonical_hashes: Dict[str, str], agent_id: str) -> List[Violation]:
    """P3: Sustitución no autorizada / digest SHA-256 alterado."""
    violations = []
    for cid, chash in active_clauses.items():
        if cid in canonical_hashes:
            if chash != canonical_hashes[cid]:
                violations.append(Violation(
                    operator=DriftOperator.P3_UNAUTHORIZED_ALTERATION,
                    target=agent_id,
                    message=f"Digest SHA-256 alterado en directiva {cid}"
                ))
    return violations
