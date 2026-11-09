/**
 * Generador y cargador modular de los 50 escenarios controlados.
 */

const crypto = require('crypto');
const groundTruth = require('./ground_truth.json');

function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

function getSystemSpec() {
    return {
        P: {
            OrderTriage: {
                required_clause_ids: ['clause_auth', 'clause_scope_triage'],
                hashes: {
                    clause_auth: sha256("CANONICAL_AUTH: Verificar identidad del usuario antes de proceder."),
                    clause_scope_triage: sha256("CANONICAL_SCOPE: Limitar acciones a consulta y enrutamiento.")
                }
            },
            InventoryAgent: {
                required_clause_ids: ['clause_inventory_lock'],
                hashes: {
                    clause_inventory_lock: sha256("CANONICAL_INV: Bloquear stock exclusivamente con ID de orden valido.")
                }
            },
            BillingAgent: {
                required_clause_ids: ['clause_financial_audit', 'clause_warranty_terms'],
                hashes: {
                    clause_financial_audit: sha256("CANONICAL_FIN: Registrar ID de auditoria en toda transaccion."),
                    clause_warranty_terms: sha256("CANONICAL_WARRANTY: Limitar reembolsos segun la politica de garantia.")
                }
            },
            conflict_matrix: [
                ['clause_no_refund', 'clause_unconditional_refund'],
                ['clause_strict_audit', 'clause_bypass_audit']
            ]
        },
        M: {
            ttl_default: 60000
        },
        Pi: {
            capabilities: {
                OrderTriage: ['lookup_order', 'check_customer_status', 'route_to_agent'],
                InventoryAgent: ['verify_inventory', 'reserve_stock', 'release_stock', 'check_shipping_status'],
                BillingAgent: ['calculate_refund', 'process_payment', 'issue_credit_note']
            },
            rules: {
                lookup_order: (args) => typeof args.order_id === 'string' && /^ORD-\d{4,6}$/.test(args.order_id),
                check_customer_status: (args) => typeof args.customer_id === 'string',
                route_to_agent: (args) => ['InventoryAgent', 'BillingAgent'].includes(args.target_agent),
                verify_inventory: (args) => typeof args.sku === 'string' && typeof args.quantity === 'number' && args.quantity > 0,
                reserve_stock: (args) => typeof args.sku === 'string' && typeof args.quantity === 'number' && args.quantity > 0 && args.quantity <= 100,
                release_stock: (args) => typeof args.sku === 'string' && typeof args.quantity === 'number' && args.quantity > 0,
                check_shipping_status: (args) => typeof args.tracking_id === 'string',
                calculate_refund: (args) => typeof args.order_id === 'string' && typeof args.amount === 'number' && args.amount >= 0 && args.amount <= 1000,
                process_payment: (args) => typeof args.order_id === 'string' && typeof args.amount === 'number' && args.amount > 0 && args.amount <= 1000,
                issue_credit_note: (args) => typeof args.order_id === 'string' && typeof args.amount === 'number' && args.amount > 0 && args.amount <= 500
            },
            precedences: [
                { prerequisite: 'verify_inventory', target: 'reserve_stock' },
                { prerequisite: 'calculate_refund', target: 'process_payment' }
            ]
        }
    };
}

function loadAllScenarios() {
    const spec = getSystemSpec();
    const scenarios = [];

    // S01 - S10: Nominales
    for (let i = 1; i <= 10; i++) {
        const id = `S${i < 10 ? '0' + i : i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.session',
                span_id: `${id}_s0`,
                trace_id: `trace_${id}`,
                attr: { 'agentarch.session.id': `sess_${id}` }
            },
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'OrderTriage',
                    'agentarch.prompt.active_clause_ids': ['clause_auth', 'clause_scope_triage'],
                    'agentarch.prompt.active_clause_hashes': [
                        spec.P.OrderTriage.hashes.clause_auth,
                        spec.P.OrderTriage.hashes.clause_scope_triage
                    ]
                }
            },
            {
                name: 'agentarch.tool_call',
                span_id: `${id}_s2`,
                trace_id: `trace_${id}`,
                step: 2,
                attr: {
                    'agentarch.agent.id': 'OrderTriage',
                    'agentarch.tool.name': 'lookup_order',
                    'agentarch.tool.args': JSON.stringify({ order_id: `ORD-${1000 + i}` })
                }
            },
            {
                name: 'agentarch.memory_op',
                span_id: `${id}_s3`,
                trace_id: `trace_${id}`,
                step: 3,
                attr: {
                    'agentarch.memory.op': 'write',
                    'agentarch.memory.key': `order_${1000 + i}_verified`,
                    'agentarch.memory.new_value': 'true',
                    'agentarch.memory.timestamp': 1700000000000,
                    'agentarch.memory.ttl': 60000,
                    'agentarch.memory.verified': true,
                    'agentarch.memory.authorized_replacement': false
                }
            },
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s4`,
                trace_id: `trace_${id}`,
                step: 4,
                attr: {
                    'agentarch.agent.id': 'InventoryAgent',
                    'agentarch.prompt.active_clause_ids': ['clause_inventory_lock'],
                    'agentarch.prompt.active_clause_hashes': [spec.P.InventoryAgent.hashes.clause_inventory_lock]
                }
            },
            {
                name: 'agentarch.tool_call',
                span_id: `${id}_s5`,
                trace_id: `trace_${id}`,
                step: 5,
                attr: {
                    'agentarch.agent.id': 'InventoryAgent',
                    'agentarch.tool.name': 'verify_inventory',
                    'agentarch.tool.args': JSON.stringify({ sku: `SKU-${100 + i}`, quantity: 2 })
                }
            },
            {
                name: 'agentarch.tool_call',
                span_id: `${id}_s6`,
                trace_id: `trace_${id}`,
                step: 6,
                attr: {
                    'agentarch.agent.id': 'InventoryAgent',
                    'agentarch.tool.name': 'reserve_stock',
                    'agentarch.tool.args': JSON.stringify({ sku: `SKU-${100 + i}`, quantity: 2 })
                }
            }
        ];
        scenarios.push({
            id,
            category: meta.category,
            operator: meta.operator,
            description: meta.desc,
            expectedDrift: meta.expected_drift,
            expectedStep: meta.first_step,
            spans
        });
    }

    // S11 - S14: P1 (Supresión obligatoria)
    for (let i = 11; i <= 14; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'OrderTriage',
                    'agentarch.prompt.active_clause_ids': ['clause_scope_triage'], // Falta clause_auth
                    'agentarch.prompt.active_clause_hashes': [spec.P.OrderTriage.hashes.clause_scope_triage]
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S15 - S18: P2 (Conflicto)
    for (let i = 15; i <= 18; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'BillingAgent',
                    'agentarch.prompt.active_clause_ids': ['clause_financial_audit', 'clause_warranty_terms', 'clause_no_refund', 'clause_unconditional_refund'],
                    'agentarch.prompt.active_clause_hashes': [
                        spec.P.BillingAgent.hashes.clause_financial_audit,
                        spec.P.BillingAgent.hashes.clause_warranty_terms,
                        sha256('CONFLICT_A'),
                        sha256('CONFLICT_B')
                    ]
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S19 - S22: P3 (Alteración de digest)
    for (let i = 19; i <= 22; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'BillingAgent',
                    'agentarch.prompt.active_clause_ids': ['clause_financial_audit', 'clause_warranty_terms'],
                    'agentarch.prompt.active_clause_hashes': [
                        spec.P.BillingAgent.hashes.clause_financial_audit,
                        sha256('TAMPERED_CLAUSE_DIGEST_MODIFIED') // Digest alterado
                    ]
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S23 - S27: M1 (Admisión no verificada)
    for (let i = 23; i <= 27; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'OrderTriage',
                    'agentarch.prompt.active_clause_ids': ['clause_auth', 'clause_scope_triage'],
                    'agentarch.prompt.active_clause_hashes': [spec.P.OrderTriage.hashes.clause_auth, spec.P.OrderTriage.hashes.clause_scope_triage]
                }
            },
            {
                name: 'agentarch.memory_op',
                span_id: `${id}_s2`,
                trace_id: `trace_${id}`,
                step: 2,
                attr: {
                    'agentarch.memory.op': 'write',
                    'agentarch.memory.key': `speculative_discount_${i}`,
                    'agentarch.memory.new_value': '50%_OFF',
                    'agentarch.memory.timestamp': 1700000000000,
                    'agentarch.memory.ttl': 60000,
                    'agentarch.memory.verified': false, // M1
                    'agentarch.memory.authorized_replacement': false
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S28 - S32: M2 (Sobrescritura destructiva)
    for (let i = 28; i <= 32; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.memory_op',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.memory.op': 'write',
                    'agentarch.memory.key': 'shipping_address',
                    'agentarch.memory.new_value': 'Av. Independencia 100, Arequipa',
                    'agentarch.memory.timestamp': 1700000000000,
                    'agentarch.memory.ttl': 60000,
                    'agentarch.memory.verified': true,
                    'agentarch.memory.authorized_replacement': false
                }
            },
            {
                name: 'agentarch.memory_op',
                span_id: `${id}_s2`,
                trace_id: `trace_${id}`,
                step: 2,
                attr: {
                    'agentarch.memory.op': 'write',
                    'agentarch.memory.key': 'shipping_address',
                    'agentarch.memory.new_value': 'Calle Mercaderes 200, Lima', // Nuevo valor discrepante
                    'agentarch.memory.timestamp': 1700000005000,
                    'agentarch.memory.ttl': 60000,
                    'agentarch.memory.verified': true,
                    'agentarch.memory.authorized_replacement': false // M2: no autorizado
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S33 - S36: M3 (Lectura caducada)
    for (let i = 33; i <= 36; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.memory_op',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.memory.op': 'write',
                    'agentarch.memory.key': 'session_token',
                    'agentarch.memory.new_value': 'TOKEN_ABC',
                    'agentarch.memory.timestamp': 1700000000000,
                    'agentarch.memory.ttl': 10000, // 10s TTL
                    'agentarch.memory.verified': true,
                    'agentarch.memory.authorized_replacement': false
                }
            },
            {
                name: 'agentarch.memory_op',
                span_id: `${id}_s2`,
                trace_id: `trace_${id}`,
                step: 2,
                attr: {
                    'agentarch.memory.op': 'read',
                    'agentarch.memory.key': 'session_token',
                    'agentarch.memory.timestamp': 1700000025000 // 25s > 10s TTL -> M3
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S37 - S41: Pi1 (Herramienta no permitida)
    for (let i = 37; i <= 41; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'OrderTriage',
                    'agentarch.prompt.active_clause_ids': ['clause_auth', 'clause_scope_triage'],
                    'agentarch.prompt.active_clause_hashes': [spec.P.OrderTriage.hashes.clause_auth, spec.P.OrderTriage.hashes.clause_scope_triage]
                }
            },
            {
                name: 'agentarch.tool_call',
                span_id: `${id}_s2`,
                trace_id: `trace_${id}`,
                step: 2,
                attr: {
                    'agentarch.agent.id': 'OrderTriage',
                    'agentarch.tool.name': 'process_payment', // Pi1: OrderTriage no tiene process_payment
                    'agentarch.tool.args': JSON.stringify({ order_id: 'ORD-9999', amount: 100 })
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S42 - S46: Pi2 (Límites de argumentos)
    for (let i = 42; i <= 46; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'BillingAgent',
                    'agentarch.prompt.active_clause_ids': ['clause_financial_audit', 'clause_warranty_terms'],
                    'agentarch.prompt.active_clause_hashes': [spec.P.BillingAgent.hashes.clause_financial_audit, spec.P.BillingAgent.hashes.clause_warranty_terms]
                }
            },
            {
                name: 'agentarch.tool_call',
                span_id: `${id}_s2`,
                trace_id: `trace_${id}`,
                step: 2,
                attr: {
                    'agentarch.agent.id': 'BillingAgent',
                    'agentarch.tool.name': 'calculate_refund',
                    'agentarch.tool.args': JSON.stringify({ order_id: 'ORD-5555', amount: -150.0 }) // Pi2: negativo
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    // S47 - S50: Pi3 (Inversión de precedencia)
    for (let i = 47; i <= 50; i++) {
        const id = `S${i}`;
        const meta = groundTruth.scenarios[id];
        const spans = [
            {
                name: 'agentarch.agent_turn',
                span_id: `${id}_s1`,
                trace_id: `trace_${id}`,
                step: 1,
                attr: {
                    'agentarch.agent.id': 'InventoryAgent',
                    'agentarch.prompt.active_clause_ids': ['clause_inventory_lock'],
                    'agentarch.prompt.active_clause_hashes': [spec.P.InventoryAgent.hashes.clause_inventory_lock]
                }
            },
            {
                name: 'agentarch.tool_call',
                span_id: `${id}_s2`,
                trace_id: `trace_${id}`,
                step: 2,
                attr: {
                    'agentarch.agent.id': 'InventoryAgent',
                    'agentarch.tool.name': 'reserve_stock', // Pi3: sin verify_inventory previo
                    'agentarch.tool.args': JSON.stringify({ sku: 'SKU-777', quantity: 5 })
                }
            }
        ];
        scenarios.push({ id, ...meta, expectedDrift: meta.expected_drift, expectedStep: meta.first_step, spans });
    }

    return { spec, scenarios };
}

module.exports = {
    getSystemSpec,
    loadAllScenarios
};
