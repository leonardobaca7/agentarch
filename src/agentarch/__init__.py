"""AgentArch: Runtime Architectural Drift Detection for LLM Multi-Agent Systems."""

__version__ = "0.1.0"

from .models import (
    Span,
    Violation,
    AuditEvent,
    ConformanceReport,
    ConformanceStatus,
    DriftOperator
)
from .audit_queue import AuditQueue
from .offline_verifier import OfflineTraceVerifier
from .span_processor import AgentArchSpanProcessor

__all__ = [
    "Span",
    "Violation",
    "AuditEvent",
    "ConformanceReport",
    "ConformanceStatus",
    "DriftOperator",
    "AuditQueue",
    "OfflineTraceVerifier",
    "AgentArchSpanProcessor"
]
