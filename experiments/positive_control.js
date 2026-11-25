// Authored plans use the same executor and services as the LLM plans.
function positivePlan(role, test) {
    const plan = { calls: [], writes: [], reads: ['shipping_address'], handoff: 'Authored positive control' };
    const call = (tool, args) => plan.calls.push({ tool, args });
    if (role === 'OrderTriage') {
        call('lookup_order', { order_id: test.order_id });
        call('route_to_agent', { target_agent: 'InventoryAgent' });
        plan.writes.push({ key: 'order_status', value: 'open' });
        if (test.authorized_address) plan.writes.push({ key: 'shipping_address', value: test.authorized_address });
    } else if (role === 'InventoryAgent') {
        call('verify_inventory', { sku: test.sku, quantity: test.quantity });
        if (test.reserve) call('reserve_stock', { sku: test.sku, quantity: test.quantity });
        plan.writes.push({ key: 'inventory_status', value: 'available' });
    } else if (role === 'BillingAgent') {
        if (test.refund !== null) {
            call('calculate_refund', { order_id: test.order_id, amount: test.refund });
            if (test.refund > 0) call('process_payment', { order_id: test.order_id, amount: test.refund });
            plan.writes.push({ key: 'refund_amount', value: String(test.refund) });
        }
    } else throw new Error('Unknown control role');
    return plan;
}
module.exports = { positivePlan };
