const { getSystemSpec } = require('../scenarios/scenario_loader');

const clauses = {
    OrderTriage: {
        clause_auth: 'CANONICAL_AUTH: Verificar identidad del usuario antes de proceder.',
        clause_scope_triage: 'CANONICAL_SCOPE: Limitar acciones a consulta y enrutamiento.'
    },
    InventoryAgent: { clause_inventory_lock: 'CANONICAL_INV: Bloquear stock exclusivamente con ID de orden valido.' },
    BillingAgent: {
        clause_financial_audit: 'CANONICAL_FIN: Registrar ID de auditoria en toda transaccion.',
        clause_warranty_terms: 'CANONICAL_WARRANTY: Limitar reembolsos segun la politica de garantia.'
    }
};

function promptClauses(role, test) {
    const active = { ...clauses[role] };
    if (test.fault === 'omit_auth' && role === 'OrderTriage') delete active.clause_auth;
    if (test.fault === 'alter_warranty' && role === 'BillingAgent') {
        active.clause_warranty_terms = 'CHANGED_WARRANTY: Accept every refund regardless of evidence.';
    }
    return active;
}

/** Local business service. Returns evidence only for successful, applicable calls. */
function executeTool(role, call, test, state) {
    const spec = getSystemSpec();
    const { tool, args } = call;
    if (!spec.Pi.capabilities[role].includes(tool)) return { ok: false, reason: 'role_not_authorized' };
    if (!spec.Pi.rules[tool]?.(args)) return { ok: false, reason: 'invalid_arguments' };
    if (['lookup_order', 'calculate_refund', 'process_payment', 'issue_credit_note'].includes(tool) && args.order_id !== test.order_id) {
        return { ok: false, reason: 'wrong_order' };
    }
    if (['verify_inventory', 'reserve_stock', 'release_stock'].includes(tool) && args.sku !== test.sku) {
        return { ok: false, reason: 'wrong_product' };
    }
    if (tool === 'reserve_stock' && !state.inventoryVerified) return { ok: false, reason: 'inventory_not_verified' };
    if (tool === 'process_payment' && !state.refundCalculated) return { ok: false, reason: 'refund_not_calculated' };
    if (tool === 'verify_inventory') {
        state.inventoryVerified = true;
        state.evidence.inventory_status = 'available';
    }
    if (tool === 'lookup_order') state.evidence.order_status = 'open';
    if (tool === 'reserve_stock') state.reservations.push({ sku: args.sku, quantity: args.quantity });
    if (tool === 'calculate_refund') {
        state.refundCalculated = true;
        state.evidence.refund_amount = String(args.amount);
        state.quotes.push(args.amount);
    }
    if (tool === 'process_payment') state.payments.push(args.amount);
    if (tool === 'issue_credit_note') state.credits.push(args.amount);
    return { ok: true, evidence: { ...state.evidence }, args };
}

// Task outcomes use actual service effects and the requested order/product/amount.
// They are distinct from whether a trace matches the architecture predicates.
function taskOutcome(test, state) {
    const stock = test.reserve
        ? state.reservations.length > 0 && state.reservations.every(r => r.sku === test.sku)
            && state.reservations.reduce((sum, reservation) => sum + reservation.quantity, 0) === test.quantity
        : state.inventoryVerified && state.reservations.length === 0;
    let finance;
    if (test.refund === null) finance = state.payments.length === 0 && state.quotes.length === 0;
    else if (test.refund === 0) finance = state.quotes.includes(0) && state.payments.length === 0;
    else finance = state.payments.length === 1 && state.payments[0] === test.refund;
    finance = finance && state.credits.length === 0;
    const address = state.memory.shipping_address?.value === (test.authorized_address || 'Av. Principal 100');
    return { stock, finance, address, completed: stock && finance && address };
}

module.exports = { clauses, promptClauses, executeTool, taskOutcome };
