const fs = require('node:fs');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const { AgentArchSpanProcessor } = require('../src/agentarch');
const { AgentArchOtelProcessor } = require('../src/agentarch/otel_processor');
const { getSystemSpec } = require('../scenarios/scenario_loader');
const { describe } = require('./statistics');
const spec = getSystemSpec();
const output = 'results/latency_supplement';
if (fs.existsSync(output)) throw new Error('Use a fresh output directory; preserve earlier measurements');
const paths = [
    { name: 'Lectura', alert: false, adapter: false },
    { name: 'Lectura', alert: true, adapter: false },
    { name: 'Adaptador turno', alert: false, adapter: true },
    { name: 'Adaptador turno', alert: true, adapter: true }
].map(p => ({ ...p, samples: [] }));
for (let batch = 0; batch < 100; batch++) {
    for (let offset = 0; offset < paths.length; offset++) {
        const test = paths[(batch + offset) % paths.length];
        let alerts = 0;
        const processor = test.adapter ? new AgentArchOtelProcessor(spec, () => alerts++) : new AgentArchSpanProcessor(spec);
        let span;
        if (test.adapter) {
            span = { name: 'agentarch.agent_turn', spanContext: () => ({ traceId: 'bench-trace', spanId: 'bench-span' }),
                endTime: [0, 0], attributes: { 'agentarch.agent.id': 'OrderTriage',
                    'agentarch.prompt.active_clause_ids': test.alert ? ['clause_scope_triage'] : ['clause_auth', 'clause_scope_triage'],
                    'agentarch.prompt.active_clause_hashes': test.alert ? [spec.P.OrderTriage.hashes.clause_scope_triage]
                        : [spec.P.OrderTriage.hashes.clause_auth, spec.P.OrderTriage.hashes.clause_scope_triage] } };
        } else {
            processor.onEnd({ name: 'agentarch.memory_op', attr: {
                'agentarch.memory.op': 'write', 'agentarch.memory.key': 'k', 'agentarch.memory.new_value': 'v',
                'agentarch.memory.timestamp': 0, 'agentarch.memory.ttl': 10, 'agentarch.memory.verified': true } });
            span = { name: 'agentarch.memory_op', attr: { 'agentarch.memory.op': 'read', 'agentarch.memory.key': 'k',
                'agentarch.memory.timestamp': test.alert ? 11 : 10 } };
        }
        for (let i = 0; i < 1000; i++) processor.onEnd(span);
        if (!test.adapter) processor.auditQueue.drain();
        alerts = 0;
        const start = performance.now();
        for (let i = 0; i < 1000; i++) processor.onEnd(span);
        test.samples.push((performance.now() - start) * 1000 / 1000);
        if (!test.adapter) alerts = processor.auditQueue.drain().length;
        if (alerts !== (test.alert ? 1000 : 0)) throw new Error('Unexpected alert count');
    }
}
const stats = paths.map(p => ({ ...p, ...describe(p.samples) }));
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(output + '/measurements.json', JSON.stringify({ metadata: {
    timestamp: new Date().toISOString(), node: process.version, cpu: os.cpus()[0].model,
    commit: execFileSync('git', ['-c', 'safe.directory=' + process.cwd().replaceAll('\\', '/'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    batches: 100, callsPerBatch: 1000, warmupPerBatch: 1000, percentiles: 'R7 on batch means',
    adapterScope: 'ReadableSpan-shaped input; includes adapter conversion, session lookup, timing, drain and audit callback; excludes SDK span creation and export'
}, stats }, null, 2));
fs.writeFileSync('paper_assets/tabla_tiempos_complementarios.tex', [String.raw`\begin{table*}[!t]`,
    String.raw`\caption{Lectura y adaptador: $\mu\mathrm{s}$ por llamada, estadísticos de cien medias de lote}`,
    String.raw`\label{tab:supplement_time}\centering\footnotesize`,
    String.raw`\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}llrrrrrr}\hline`,
    String.raw`Camino & Estado & Media & DE & Mín. & Mediana & p95 & p99\\\hline`,
    ...stats.map(s => [s.name, s.alert ? 'Con alerta' : 'Conforme', ...[s.mean, s.sd, s.min, s.median, s.p95, s.p99].map(n => n.toFixed(3))].join(' & ') + String.raw`\\`),
    String.raw`\hline\end{tabular*}\end{table*}`, ''].join('\n'));
console.table(stats.map(({ samples, ...s }) => s));
