/**
 * Pruebas unitarias de sanidad de los 9 operadores de deriva y del SpanProcessor.
 */

const assert = require('assert');
const { AgentArchSpanProcessor, sha256 } = require('../src/agentarch/index');
const { getSystemSpec } = require('../scenarios/scenario_loader');

function runUnitTests() {
    console.log('=== EJECUTANDO PRUEBAS UNITARIAS DE AGENTARCH ===\n');
    const spec = getSystemSpec();

    // Test 1: P1
    {
        const verifier = new AgentArchSpanProcessor(spec);
        const span = {
            name: 'agentarch.agent_turn',
            attr: {
                'agentarch.agent.id': 'OrderTriage',
                'agentarch.prompt.active_clause_ids': ['clause_scope_triage'], // falta clause_auth
                'agentarch.prompt.active_clause_hashes': [spec.P.OrderTriage.hashes.clause_scope_triage]
            }
        };
        const viols = verifier.onEnd(span);
        assert.strictEqual(viols.length, 1, 'Debe detectar exactamente 1 violación P1');
        assert.strictEqual(viols[0].op, 'P1');
        console.log('✓ Test 1 superado: Operador P1 (Supresión obligatoria)');
    }

    // Test 2: P2
    {
        const verifier = new AgentArchSpanProcessor(spec);
        const span = {
            name: 'agentarch.agent_turn',
            attr: {
                'agentarch.agent.id': 'BillingAgent',
                'agentarch.prompt.active_clause_ids': ['clause_financial_audit', 'clause_warranty_terms', 'clause_no_refund', 'clause_unconditional_refund'],
                'agentarch.prompt.active_clause_hashes': [spec.P.BillingAgent.hashes.clause_financial_audit, spec.P.BillingAgent.hashes.clause_warranty_terms, sha256('A'), sha256('B')]
            }
        };
        const viols = verifier.onEnd(span);
        assert.strictEqual(viols.some(v => v.op === 'P2'), true, 'Debe detectar P2');
        console.log('✓ Test 2 superado: Operador P2 (Inyección de conflicto)');
    }

    // Test 3: P3
    {
        const verifier = new AgentArchSpanProcessor(spec);
        const span = {
            name: 'agentarch.agent_turn',
            attr: {
                'agentarch.agent.id': 'BillingAgent',
                'agentarch.prompt.active_clause_ids': ['clause_financial_audit', 'clause_warranty_terms'],
                'agentarch.prompt.active_clause_hashes': [spec.P.BillingAgent.hashes.clause_financial_audit, sha256('TAMPERED')]
            }
        };
        const viols = verifier.onEnd(span);
        assert.strictEqual(viols.some(v => v.op === 'P3'), true, 'Debe detectar P3');
        console.log('✓ Test 3 superado: Operador P3 (Alteración de digest SHA-256)');
    }

    // Test 4: M1
    {
        const verifier = new AgentArchSpanProcessor(spec);
        const span = {
            name: 'agentarch.memory_op',
            attr: {
                'agentarch.memory.op': 'write',
                'agentarch.memory.key': 'discount_code',
                'agentarch.memory.new_value': 'PROMO99',
                'agentarch.memory.verified': false, // Violación M1
                'agentarch.memory.authorized_replacement': false
            }
        };
        const viols = verifier.onEnd(span);
        assert.strictEqual(viols.some(v => v.op === 'M1'), true, 'Debe detectar M1');
        console.log('✓ Test 4 superado: Operador M1 (Admisión no verificada)');
    }

    // Test 5: M2
    {
        const verifier = new AgentArchSpanProcessor(spec);
        verifier.onEnd({
            name: 'agentarch.memory_op',
            attr: {
                'agentarch.memory.op': 'write',
                'agentarch.memory.key': 'address',
                'agentarch.memory.new_value': 'Calle 1',
                'agentarch.memory.verified': true,
                'agentarch.memory.authorized_replacement': false
            }
        });
        const viols = verifier.onEnd({
            name: 'agentarch.memory_op',
            attr: {
                'agentarch.memory.op': 'write',
                'agentarch.memory.key': 'address',
                'agentarch.memory.new_value': 'Calle 2', // Discrepante
                'agentarch.memory.verified': true,
                'agentarch.memory.authorized_replacement': false // Violación M2
            }
        });
        assert.strictEqual(viols.some(v => v.op === 'M2'), true, 'Debe detectar M2');
        console.log('✓ Test 5 superado: Operador M2 (Sobrescritura destructiva)');
    }

    // Test 6: M3
    {
        const verifier = new AgentArchSpanProcessor(spec);
        verifier.onEnd({
            name: 'agentarch.memory_op',
            attr: {
                'agentarch.memory.op': 'write',
                'agentarch.memory.key': 'temp_token',
                'agentarch.memory.new_value': 'TOKEN',
                'agentarch.memory.timestamp': 1000,
                'agentarch.memory.ttl': 5000,
                'agentarch.memory.verified': true,
                'agentarch.memory.authorized_replacement': false
            }
        });
        const viols = verifier.onEnd({
            name: 'agentarch.memory_op',
            attr: {
                'agentarch.memory.op': 'read',
                'agentarch.memory.key': 'temp_token',
                'agentarch.memory.timestamp': 9000 // 8000 ms transcurrido > 5000 ms TTL
            }
        });
        assert.strictEqual(viols.some(v => v.op === 'M3'), true, 'Debe detectar M3');
        console.log('✓ Test 6 superado: Operador M3 (Lectura expirada por TTL)');
    }

    // Test 7: Pi1
    {
        const verifier = new AgentArchSpanProcessor(spec);
        const span = {
            name: 'agentarch.tool_call',
            attr: {
                'agentarch.agent.id': 'OrderTriage',
                'agentarch.tool.name': 'process_payment', // Infracción Pi1
                'agentarch.tool.args': JSON.stringify({ order_id: 'ORD-1234', amount: 50 })
            }
        };
        const viols = verifier.onEnd(span);
        assert.strictEqual(viols.some(v => v.op === 'Pi1'), true, 'Debe detectar Pi1');
        console.log('✓ Test 7 superado: Operador Pi1 (Herramienta no permitida)');
    }

    // Test 8: Pi2
    {
        const verifier = new AgentArchSpanProcessor(spec);
        const span = {
            name: 'agentarch.tool_call',
            attr: {
                'agentarch.agent.id': 'BillingAgent',
                'agentarch.tool.name': 'calculate_refund',
                'agentarch.tool.args': JSON.stringify({ order_id: 'ORD-1234', amount: -250.0 }) // Infracción Pi2
            }
        };
        const viols = verifier.onEnd(span);
        assert.strictEqual(viols.some(v => v.op === 'Pi2'), true, 'Debe detectar Pi2');
        console.log('✓ Test 8 superado: Operador Pi2 (Argumento fuera de límite)');
    }

    // Test 9: Pi3
    {
        const verifier = new AgentArchSpanProcessor(spec);
        const span = {
            name: 'agentarch.tool_call',
            attr: {
                'agentarch.agent.id': 'InventoryAgent',
                'agentarch.tool.name': 'reserve_stock', // Infracción Pi3 (falta verify_inventory)
                'agentarch.tool.args': JSON.stringify({ sku: 'SKU-001', quantity: 2 })
            }
        };
        const viols = verifier.onEnd(span);
        assert.strictEqual(viols.some(v => v.op === 'Pi3'), true, 'Debe detectar Pi3');
        console.log('✓ Test 9 superado: Operador Pi3 (Inversión de precedencia)');
    }

    console.log('\n✓ TODAS LAS PRUEBAS UNITARIAS SUPERADAS SATISFACTORIAMENTE (9/9).');
}

if (require.main === module) {
    runUnitTests();
}

module.exports = { runUnitTests };
