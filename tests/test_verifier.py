"""Pruebas unitarias en Python para AgentArch."""

import unittest
from src.agentarch.models import Span, DriftOperator
from src.agentarch.span_processor import AgentArchSpanProcessor
from src.agentarch.audit_queue import AuditQueue

class TestAgentArchOperators(unittest.TestCase):
    def setUp(self):
        self.spec = {
            "prompt_specification": {
                "roles": {
                    "OrderTriage": {
                        "required_clause_ids": ["clause_auth", "clause_scope_triage"],
                        "clauses": {
                            "clause_auth": {"sha256": "hash_auth"},
                            "clause_scope_triage": {"sha256": "hash_scope"}
                        }
                    }
                },
                "conflict_matrix": [{"pair": ["c_a", "c_b"]}]
            },
            "policy_specification": {
                "capabilities": {
                    "OrderTriage": ["lookup_order"]
                },
                "precedences": [
                    {"prerequisite": "verify", "target": "reserve"}
                ]
            },
            "validators": {
                "lookup_order": lambda args: "order_id" in args
            }
        }
        self.queue = AuditQueue()
        self.processor = AgentArchSpanProcessor(self.spec, self.queue)

    def test_p1_missing_clause(self):
        span = Span(
            name="agentarch.agent_turn",
            span_id="s1",
            trace_id="t1",
            step=1,
            attributes={
                "agentarch.agent.id": "OrderTriage",
                "agentarch.prompt.active_clause_ids": ["clause_scope_triage"],
                "agentarch.prompt.active_clause_hashes": ["hash_scope"]
            }
        )
        self.processor.on_end(span)
        event = self.queue.get()
        self.assertIsNotNone(event)
        self.assertEqual(event.violations[0].operator, DriftOperator.P1_MANDATORY_SUPPRESSION)

    def test_pi1_unauthorized_tool(self):
        span = Span(
            name="agentarch.tool_call",
            span_id="s2",
            trace_id="t1",
            step=2,
            attributes={
                "agentarch.agent.id": "OrderTriage",
                "agentarch.tool.name": "unauthorized_tool",
                "agentarch.tool.args": "{}"
            }
        )
        self.processor.on_end(span)
        event = self.queue.get()
        self.assertIsNotNone(event)
        self.assertEqual(event.violations[0].operator, DriftOperator.PI1_UNAUTHORIZED_TOOL)

if __name__ == "__main__":
    unittest.main()
