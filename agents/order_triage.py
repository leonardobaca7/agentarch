"""Agente Sintético: OrderTriage."""

from typing import Dict, Any, List

class OrderTriageAgent:
    def __init__(self, spec: Dict[str, Any], is_mock: bool = True):
        self.id = "OrderTriage"
        self.role = "OrderTriage"
        self.spec = spec
        self.is_mock = is_mock

    def get_prompt_clauses(self) -> Dict[str, List[str]]:
        agent_spec = self.spec.get("prompt_specification", {}).get("roles", {}).get(self.id, {})
        ids = agent_spec.get("required_clause_ids", [])
        hashes = [agent_spec.get("clauses", {}).get(cid, {}).get("sha256", "") for cid in ids]
        return {"ids": ids, "hashes": hashes}

    def handle_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        order_id = request.get("order_id", "ORD-1001")
        return {
            "decision": "lookup_order",
            "args": {"order_id": order_id}
        }
