const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const { AgentArchSpanProcessor } = require('../src/agentarch');
const { getSystemSpec } = require('../scenarios/scenario_loader');
const { describe } = require('./statistics');

function main() {
    const output = path.resolve('results/latency_paths');
    if (fs.existsSync(output)) throw new Error('Preserve previous measurements before starting a new run');
    fs.mkdirSync(output, { recursive: true });
    const spec = getSystemSpec();
    const cases = [];
    for (const alert of [false, true]) {
        cases.push({ name: 'Turno', alert, span: { name: 'agentarch.agent_turn', attr: {
            'agentarch.agent.id': 'OrderTriage',
            'agentarch.prompt.active_clause_ids': alert ? ['clause_scope_triage'] : ['clause_auth', 'clause_scope_triage'],
            'agentarch.prompt.active_clause_hashes': alert ? [spec.P.OrderTriage.hashes.clause_scope_triage]
                : [spec.P.OrderTriage.hashes.clause_auth, spec.P.OrderTriage.hashes.clause_scope_triage]
        } } });
        cases.push({ name: 'Memoria', alert, span: { name: 'agentarch.memory_op', attr: {
            'agentarch.memory.op': 'write', 'agentarch.memory.key': 'benchmark_key',
            'agentarch.memory.new_value': 'same_value', 'agentarch.memory.timestamp': 0,
            'agentarch.memory.ttl': 60000, 'agentarch.memory.verified': !alert,
            'agentarch.memory.authorized_replacement': false
        } } });
        cases.push({ name: 'Herramienta', alert, span: { name: 'agentarch.tool_call', attr: {
            'agentarch.agent.id': alert ? 'InventoryAgent' : 'OrderTriage',
            'agentarch.tool.name': 'lookup_order', 'agentarch.tool.args': JSON.stringify({ order_id: 'ORD-1001' })
        } } });
    }
    const batches = 100;
    const callsPerBatch = 1000;
    const measurements = cases.map(test => ({ ...test, samples: [] }));
    for (let batch = 0; batch < batches; batch++) {
        // Rotate the order to avoid assigning every late measurement to the same path.
        for (let offset = 0; offset < measurements.length; offset++) {
            const test = measurements[(batch + offset) % measurements.length];
            const verifier = new AgentArchSpanProcessor(spec);
            for (let i = 0; i < callsPerBatch; i++) verifier.onEnd(test.span);
            verifier.auditQueue.drain();
            const start = performance.now();
            for (let i = 0; i < callsPerBatch; i++) verifier.onEnd(test.span);
            const elapsedUs = (performance.now() - start) * 1000 / callsPerBatch;
            const events = verifier.auditQueue.drain();
            if (events.length !== (test.alert ? callsPerBatch : 0)) throw new Error('Unexpected alert path');
            test.samples.push(elapsedUs);
        }
    }
    const root = process.cwd();
    const metadata = { timestamp: new Date().toISOString(), batches, callsPerBatch,
        warmingCallsPerBatch: callsPerBatch, queueDrain: 'outside the measured interval',
        percentileMethod: 'linear interpolation at (n-1)*p (R7), applied to batch means',
        node: process.version, platform: os.platform(), cpu: os.cpus()[0].model,
        commit: execFileSync('git', ['-c', 'safe.directory=' + root.replaceAll('\\', '/'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() };
    const stats = measurements.map(({ name, alert, samples }) => ({ name, path: alert ? 'alert' : 'conformant', samples, ...describe(samples) }));
    fs.writeFileSync(path.join(output, 'measurements.json'), JSON.stringify({ metadata, stats }, null, 2));
    const old = require('../results/latency_run.json');
    fs.writeFileSync(path.join(output, 'historical_percentiles.json'), JSON.stringify({ originalMetadata: old.metadata,
        stats: old.stats.map(row => ({ span: row.span, ...describe(row.samples) })) }, null, 2));
    const csv = ['operation,path,mean_us,sd_us,min_us,median_us,p95_us,p99_us,max_us',
        ...stats.map(row => [row.name, row.path, row.mean, row.sd, row.min, row.median, row.p95, row.p99, row.max].join(','))];
    fs.writeFileSync(path.join(output, 'summary.csv'), csv.join('\n') + '\n');
    const table = [String.raw`\begin{table*}[!t]`,
        String.raw`\caption{Tiempo del núcleo por camino ($\mu\mathrm{s}$ por llamada, percentiles de 100 medias de lote)}`,
        String.raw`\label{tab:latency_bench}`, String.raw`\centering\footnotesize`,
        String.raw`\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}llrrrrrr}`,
        String.raw`\hline`, String.raw`Tramo & Camino & Media & DE & Mínimo & Mediana & p95 & p99\\\hline`,
        ...stats.map(row => [row.name, row.path === 'alert' ? 'Con alerta' : 'Conforme',
            ...[row.mean, row.sd, row.min, row.median, row.p95, row.p99].map(n => n.toFixed(3))].join(' & ') + String.raw`\\`),
        String.raw`\hline`, String.raw`\end{tabular*}`, String.raw`\end{table*}`, ''].join('\n');
    fs.writeFileSync('paper_assets/tabla_v_distribucion.tex', table);
    console.table(stats.map(({ samples, ...row }) => row));
}

if (require.main === module) main();

module.exports = { main };
