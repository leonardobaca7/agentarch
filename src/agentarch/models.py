"""Modelos de datos y estructuras para AgentArch."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
from enum import Enum

class ConformanceStatus(str, Enum):
    CONFORMANT = "CONFORMANT"
    DRIFT_DETECTED = "DRIFT_DETECTED"

class DriftOperator(str, Enum):
    # Prompt Drift
    P1_MANDATORY_SUPPRESSION = "P1"
    P2_CONFLICTING_INJECTION = "P2"
    P3_UNAUTHORIZED_ALTERATION = "P3"
    # Memory Drift
    M1_UNVERIFIED_ADMISSION = "M1"
    M2_DESTRUCTIVE_OVERWRITE = "M2"
    M3_STALE_READ = "M3"
    # Policy Drift
    PI1_UNAUTHORIZED_TOOL = "Pi1"
    PI2_ARGUMENT_BOUNDS = "Pi2"
    PI3_PRECEDENCE_INVERSION = "Pi3"

@dataclass
class Violation:
    operator: DriftOperator
    target: str
    message: str
    step: Optional[int] = None

@dataclass
class Span:
    name: str
    span_id: str
    trace_id: str
    attributes: Dict[str, Any] = field(default_factory=dict)
    step: Optional[int] = None
    start_time: Optional[int] = None
    end_time: Optional[int] = None

@dataclass
class AuditEvent:
    trace_id: str
    span_id: str
    timestamp: int
    status: ConformanceStatus
    violations: List[Violation]

@dataclass
class ConformanceReport:
    status: ConformanceStatus
    violations: List[Violation] = field(default_factory=list)
    first_violating_step: Optional[int] = None
    elapsed_us: float = 0.0
