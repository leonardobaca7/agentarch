const { AgentArchSpanProcessor } = require('./index');

/** Adapts SDK ReadableSpan objects and isolates verifier state by trace ID. */
class AgentArchOtelProcessor {
    constructor(spec, onAudit = () => {}) {
        this.spec = spec;
        this.onAudit = onAudit;
        this.sessions = new Map();
        this.measurementsUs = [];
    }

    onStart() {}

    onEnd(span) {
        const context = span.spanContext();
        if (span.name === 'agentarch.session') {
            this.sessions.delete(context.traceId);
            return;
        }
        if (!['agentarch.agent_turn', 'agentarch.memory_op', 'agentarch.tool_call'].includes(span.name)) return;
        if (!this.sessions.has(context.traceId)) {
            this.sessions.set(context.traceId, new AgentArchSpanProcessor(this.spec));
        }
        const verifier = this.sessions.get(context.traceId);
        const start = process.hrtime.bigint();
        verifier.onEnd({
            name: span.name,
            attr: span.attributes,
            trace_id: context.traceId,
            span_id: context.spanId,
            step: span.attributes['agentarch.step'],
            end_time: span.endTime[0] * 1000 + span.endTime[1] / 1e6
        });
        for (const event of verifier.auditQueue.drain()) this.onAudit(event);
        this.measurementsUs.push(Number(process.hrtime.bigint() - start) / 1000);
    }

    async forceFlush() {}

    async shutdown() {
        this.sessions.clear();
    }
}

module.exports = { AgentArchOtelProcessor };
