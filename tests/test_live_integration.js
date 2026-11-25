const assert = require('node:assert/strict');
const { BasicTracerProvider } = require('@opentelemetry/sdk-trace-base');
const { ROOT_CONTEXT, trace } = require('@opentelemetry/api');
const { AgentArchOtelProcessor } = require('../src/agentarch/otel_processor');
const { getSystemSpec } = require('../scenarios/scenario_loader');
const { LocalLLMAdapter } = require('../agents/local_llm_adapter');
const { labelCalls } = require('../experiments/run_live_evaluation');

async function main() {
    const events = [];
    const monitor = new AgentArchOtelProcessor(getSystemSpec(), event => events.push(event));
    const provider = new BasicTracerProvider({ spanProcessors: [monitor] });
    const tracer = provider.getTracer('integration-test');
    const a = tracer.startSpan('agentarch.session');
    const b = tracer.startSpan('agentarch.session');
    function tool(root, name, step) {
        const span = tracer.startSpan('agentarch.tool_call', { attributes: {
            'agentarch.agent.id': 'InventoryAgent', 'agentarch.step': step,
            'agentarch.tool.name': name,
            'agentarch.tool.args': JSON.stringify({ sku: 'SKU-1', quantity: 1 })
        } }, trace.setSpan(ROOT_CONTEXT, root));
        span.end();
    }
    tool(a, 'verify_inventory', 1);
    tool(b, 'reserve_stock', 1);
    tool(a, 'reserve_stock', 2);
    assert.equal(events.length, 1, 'Another session must not satisfy the prerequisite');
    assert.equal(events[0].trace_id, b.spanContext().traceId);
    assert.equal(events[0].violations[0].op, 'Pi3');
    a.end(); b.end();
    assert.equal(monitor.sessions.size, 0, 'Closed sessions must release their state');
    await provider.shutdown();

    const originalFetch = global.fetch;
    global.fetch = async () => { throw new Error('connection unavailable'); };
    try {
        await assert.rejects(new LocalLLMAdapter().generateResponse('s', 'u'), /connection unavailable/);
    } finally {
        global.fetch = originalFetch;
    }
    assert.deepEqual(labelCalls('InventoryAgent', [{ tool: 'reserve_stock', args: { sku: 'A', quantity: 1 } }]),
        [{ step: 2, operators: ['Pi3'] }]);
    assert.deepEqual(labelCalls('BillingAgent', [{ tool: 'calculate_refund', args: { order_id: 'ORD-1001', amount: -1 } }]),
        [{ step: 2, operators: ['Pi2'] }]);
    assert.deepEqual(labelCalls('OrderTriage', []), []);
    console.log('SDK trace isolation, cleanup, model failure propagation and independent labels verified.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
