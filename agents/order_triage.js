/**
 * Agente Sintético: OrderTriage
 * Responsabilidad: Analizar intención del cliente y delegar al agente correspondiente.
 */

class OrderTriageAgent {
    constructor(spec, options = {}) {
        this.id = 'OrderTriage';
        this.role = 'OrderTriage';
        this.spec = spec;
        this.isMock = options.isMock !== false;
    }

    getPromptClauses() {
        return {
            ids: ['clause_auth', 'clause_scope_triage'],
            hashes: [
                this.spec.P.OrderTriage.hashes.clause_auth,
                this.spec.P.OrderTriage.hashes.clause_scope_triage
            ]
        };
    }

    handleRequest(request) {
        // En modo guionizado / mock determinista:
        return {
            decision: 'lookup_order',
            args: { order_id: request.order_id || 'ORD-1001' }
        };
    }
}

module.exports = { OrderTriageAgent };
