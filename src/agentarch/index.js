/**
 * AgentArch: Framework de chequeo de conformidad en tiempo de ejecucion para MAS-LLM.
 */

const crypto = require('crypto');

function sha256(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}

class AuditQueue {
    constructor(maxSize = 10000) {
        this.maxSize = maxSize;
        this.items = [];
    }

    put(event) {
        if (this.items.length < this.maxSize) {
            this.items.push(event);
            return true;
        }
        return false;
    }

    get() {
        return this.items.shift() || null;
    }

    drain() {
        const out = [...this.items];
        this.items = [];
        return out;
    }

    get size() {
        return this.items.length;
    }
}

class AgentArchSpanProcessor {
    constructor(spec, auditQueue = new AuditQueue()) {
        this.spec = spec;
        this.auditQueue = auditQueue;
        this.memStore = {};
        this.completedTools = new Set();
    }

    onStart(span, context) {}

    onEnd(span) {
        const violations = [];

        // 1. Turno de agente (P1, P2, P3)
        if (span.name === 'agentarch.agent_turn') {
            const agent = span.attr['agentarch.agent.id'];
            const activeIds = span.attr['agentarch.prompt.active_clause_ids'] || [];
            const activeHashes = span.attr['agentarch.prompt.active_clause_hashes'] || [];
            const agentSpec = this.spec.P[agent];

            if (agentSpec) {
                // P1: Directiva obligatoria ausente
                for (const req of agentSpec.required_clause_ids) {
                    if (!activeIds.includes(req)) {
                        violations.push({ op: 'P1', target: agent, msg: `Falta directiva obligatoria: ${req}` });
                    }
                }
                // P2: Cláusulas en conflicto
                for (const [c1, c2] of (this.spec.P.conflict_matrix || [])) {
                    if (activeIds.includes(c1) && activeIds.includes(c2)) {
                        violations.push({ op: 'P2', target: agent, msg: `Inyección de conflicto: ${c1} y ${c2}` });
                    }
                }
                // P3: Alteración de hash
                for (let i = 0; i < activeIds.length; i++) {
                    const cid = activeIds[i];
                    const chash = activeHashes[i];
                    if (agentSpec.hashes[cid] && agentSpec.hashes[cid] !== chash) {
                        violations.push({ op: 'P3', target: agent, msg: `Digest alterado en directiva: ${cid}` });
                    }
                }
            }
        }

        // 2. Operaciones de memoria (M1, M2, M3)
        else if (span.name === 'agentarch.memory_op') {
            const op = span.attr['agentarch.memory.op'];
            const key = span.attr['agentarch.memory.key'];

            if (op === 'write') {
                const verified = span.attr['agentarch.memory.verified'];
                const val = span.attr['agentarch.memory.new_value'];
                const auth = span.attr['agentarch.memory.authorized_replacement'];
                const ts = span.attr['agentarch.memory.timestamp'];
                const ttl = span.attr['agentarch.memory.ttl'];

                // M1: Admisión no verificada
                if (!verified) {
                    violations.push({ op: 'M1', target: key, msg: `Admisión no verificada en memoria: ${key}` });
                }
                // M2: Sobrescritura destructiva no autorizada
                if (this.memStore[key] && this.memStore[key].val !== val && !auth) {
                    violations.push({ op: 'M2', target: key, msg: `Sobrescritura destructiva en clave: ${key}` });
                }
                this.memStore[key] = { val, ts, ttl };
            } else if (op === 'read') {
                const tsNow = span.attr['agentarch.memory.timestamp'];
                if (this.memStore[key]) {
                    const entry = this.memStore[key];
                    // M3: Lectura caducada por TTL
                    if (tsNow - entry.ts > entry.ttl) {
                        violations.push({ op: 'M3', target: key, msg: `Lectura caducada en clave: ${key}` });
                    }
                }
            }
        }

        // 3. Llamadas a herramientas (Pi1, Pi2, Pi3)
        else if (span.name === 'agentarch.tool_call') {
            const agent = span.attr['agentarch.agent.id'];
            const tool = span.attr['agentarch.tool.name'];
            let args = {};
            try {
                args = typeof span.attr['agentarch.tool.args'] === 'string'
                    ? JSON.parse(span.attr['agentarch.tool.args'])
                    : span.attr['agentarch.tool.args'];
            } catch (e) {}

            // Pi1: Herramienta no autorizada
            const allowed = this.spec.Pi.capabilities[agent] || [];
            if (!allowed.includes(tool)) {
                violations.push({ op: 'Pi1', target: tool, msg: `Herramienta ${tool} no permitida para ${agent}` });
            }

            // Pi2: Límites de argumentos
            const validator = this.spec.Pi.rules[tool];
            if (validator && !validator(args)) {
                violations.push({ op: 'Pi2', target: tool, msg: `Argumentos fuera de límite en ${tool}` });
            }

            // Pi3: Inversión de precedencia
            for (const prec of (this.spec.Pi.precedences || [])) {
                if (tool === prec.target && !this.completedTools.has(prec.prerequisite)) {
                    violations.push({ op: 'Pi3', target: tool, msg: `Precedencia violada: ${tool} sin ${prec.prerequisite}` });
                }
            }
            this.completedTools.add(tool);
        }

        if (violations.length > 0) {
            const event = {
                trace_id: span.trace_id || 'trace_0',
                span_id: span.span_id || 'span_0',
                step: span.step || 1,
                timestamp: span.end_time || Date.now(),
                status: 'DRIFT_DETECTED',
                violations
            };
            this.auditQueue.put(event);
        }

        return violations;
    }
}

module.exports = {
    sha256,
    AuditQueue,
    AgentArchSpanProcessor
};
