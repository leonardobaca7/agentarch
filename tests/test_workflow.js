const assert = require('node:assert/strict');
const { executeTool, taskOutcome, promptClauses } = require('../experiments/workflow_domain');
const { labelWorkflow } = require('../experiments/label_workflow');
const cases = require('../experiments/workflow_cases.json');

const test = cases[0];
const state = { evidence: {}, memory: { shipping_address: { value: 'Av. Principal 100' } },
    inventoryVerified: false, refundCalculated: false, reservations: [], payments: [], quotes: [], credits: [] };
assert.equal(executeTool('InventoryAgent', { tool: 'reserve_stock', args: { sku: test.sku, quantity: 1 } }, test, state).ok, false);
assert.equal(executeTool('InventoryAgent', { tool: 'verify_inventory', args: { sku: 'OTHER', quantity: 1 } }, test, state).ok, false);
assert.equal(state.inventoryVerified, false);
assert.equal(executeTool('InventoryAgent', { tool: 'verify_inventory', args: { sku: test.sku, quantity: 1 } }, test, state).ok, true);
assert.equal(executeTool('InventoryAgent', { tool: 'reserve_stock', args: { sku: test.sku, quantity: 1 } }, test, state).ok, true);
assert.equal(executeTool('BillingAgent', { tool: 'calculate_refund', args: { order_id: 'OTHER', amount: 25 } }, test, state).ok, false);
assert.equal(executeTool('BillingAgent', { tool: 'calculate_refund', args: { order_id: test.order_id, amount: 25 } }, test, state).ok, true);
assert.equal(executeTool('BillingAgent', { tool: 'process_payment', args: { order_id: test.order_id, amount: 25 } }, test, state).ok, true);
assert.equal(taskOutcome(test, state).completed, true);
assert.equal(taskOutcome({ ...test, quantity: 2 }, state).completed, false);
assert.deepEqual(labelWorkflow([{ type: 'turn', role: 'OrderTriage', step: 1,
    clauses: promptClauses('OrderTriage', cases.find(c => c.fault === 'omit_auth')) }]), [{ step: 1, operators: ['P1'] }]);
assert.deepEqual(labelWorkflow([
    { type: 'write', key: 'x', value: 'A', evidence: { x: 'A' }, authorized: false, timestamp: 0, ttl: 10, step: 1 },
    { type: 'write', key: 'x', value: 'B', evidence: { x: 'A' }, authorized: false, timestamp: 1, ttl: 10, step: 2 },
    { type: 'read', key: 'x', timestamp: 20, step: 3 }
]), [{ step: 2, operators: ['M1', 'M2'] }, { step: 3, operators: ['M3'] }]);
console.log('Business effects, wrong resource rejection, task outcome and workflow annotation verified.');
