"""Reglas de verificación de deriva de políticas operacionales (Pi1, Pi2, Pi3)."""

from typing import List, Dict, Any, Set
from .models import Violation, DriftOperator

def evaluate_pi1(tool_name: str, allowed_tools: List[str], agent_id: str) -> List[Violation]:
    """Pi1: Invocación de herramienta fuera del perfil estático de capacidades."""
    violations = []
    if tool_name not in allowed_tools:
        violations.append(Violation(
            operator=DriftOperator.PI1_UNAUTHORIZED_TOOL,
            target=tool_name,
            message=f"Herramienta '{tool_name}' no autorizada para el rol '{agent_id}'"
        ))
    return violations

def evaluate_pi2(tool_name: str, args: Dict[str, Any], validator_fn: Any, agent_id: str) -> List[Violation]:
    """Pi2: Violación de límites de argumentos o esquemas tipados."""
    violations = []
    if validator_fn and not validator_fn(args):
        violations.append(Violation(
            operator=DriftOperator.PI2_ARGUMENT_BOUNDS,
            target=tool_name,
            message=f"Argumentos fuera de límite o no conformes con el esquema en herramienta '{tool_name}'"
        ))
    return violations

def evaluate_pi3(tool_name: str, completed_tools: Set[str], precedences: List[Dict[str, str]], agent_id: str) -> List[Violation]:
    """Pi3: Inversión de precedencia operacional causal."""
    violations = []
    for prec in precedences:
        if tool_name == prec.get("target"):
            prereq = prec.get("prerequisite")
            if prereq and prereq not in completed_tools:
                violations.append(Violation(
                    operator=DriftOperator.PI3_PRECEDENCE_INVERSION,
                    target=tool_name,
                    message=f"Violación de precedencia: acción '{tool_name}' ejecutada sin completar previamente '{prereq}'"
                ))
    return violations
