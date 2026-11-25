/**
 * Microbenchmark de sobrecarga de latencia por tipo de tramo OpenTelemetry (N = 50,000 iteraciones).
 */

const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const path = require('path');
const { performance } = require('perf_hooks');
const { AgentArchSpanProcessor } = require('../src/agentarch/index');
const { getSystemSpec } = require('../scenarios/scenario_loader');

function runBenchmark(N = 50000) {
    const spec = getSystemSpec();

    console.log(`=== INICIANDO BENCHMARK DE LATENCIA (N = ${N.toLocaleString()} iteraciones) ===`);

    // 1. Tramo agent_turn
    const turnSpan = {
        name: 'agentarch.agent_turn',
        attr: {
            'agentarch.agent.id': 'OrderTriage',
            'agentarch.prompt.active_clause_ids': ['clause_auth', 'clause_scope_triage'],
            'agentarch.prompt.active_clause_hashes': [
                spec.P.OrderTriage.hashes.clause_auth,
                spec.P.OrderTriage.hashes.clause_scope_triage
            ]
        }
    };

    // 2. Tramo memory_op
    const memSpan = {
        name: 'agentarch.memory_op',
        attr: {
            'agentarch.memory.op': 'write',
            'agentarch.memory.key': 'order_1001_verified',
            'agentarch.memory.new_value': 'true',
            'agentarch.memory.timestamp': 1700000000000,
            'agentarch.memory.ttl': 60000,
            'agentarch.memory.verified': true,
            'agentarch.memory.authorized_replacement': false
        }
    };

    // 3. Tramo tool_call
    const toolSpan = {
        name: 'agentarch.tool_call',
        attr: {
            'agentarch.agent.id': 'OrderTriage',
            'agentarch.tool.name': 'lookup_order',
            'agentarch.tool.args': JSON.stringify({ order_id: 'ORD-1001' })
        }
    };

    const batches = 50;
    if (!Number.isSafeInteger(N) || N < batches || N % batches !== 0) {
        throw new RangeError('N debe ser un múltiplo positivo de 50');
    }
    const batchSize = N / batches;
    const measurements = [
        { span: turnSpan, label: 'Turno', samples: [] },
        { span: memSpan, label: 'Memoria', samples: [] },
        { span: toolSpan, label: 'Herramienta', samples: [] }
    ];

    for (let batch = -1; batch < batches; batch++) {
        for (const measurement of measurements) {
            const verifier = new AgentArchSpanProcessor(spec);
            // Calentar el mismo camino antes de medir el lote.
            for (let i = 0; i < batchSize; i++) verifier.onEnd(measurement.span);
            if (batch < 0) continue;
            const start = performance.now();
            for (let i = 0; i < batchSize; i++) verifier.onEnd(measurement.span);
            measurement.samples.push((performance.now() - start) * 1000 / batchSize);
        }
    }

    const stats = measurements.map(({ span, label, samples }) => {
        const mean = samples.reduce((sum, sample) => sum + sample, 0) / batches;
        const variance = samples.reduce((sum, sample) => sum + (sample - mean) ** 2, 0) / (batches - 1);
        return { span: span.name, label, mean, sd: Math.sqrt(variance), samples };
    });

    const root = path.join(__dirname, '..');
    let commit = null;
    try {
        commit = execFileSync('git', ['-c', 'safe.directory=' + root.replaceAll('\\', '/'),
            'rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
        // Los archivos exportados sin historial también se pueden evaluar.
    }
    const metadata = {
        commit, timestamp: new Date().toISOString(), node: process.version,
        platform: os.platform(), release: os.release(), arch: os.arch(),
        cpu: os.cpus()[0]?.model ?? null, batches, batchSize
    };
    fs.writeFileSync(path.join(root, 'results/latency_run.json'),
        JSON.stringify({ metadata, stats }, null, 2) + '\n');
    const csv = [
        'span_type,mean_latency_us,batch_std_dev_us,batches,calls_per_batch',
        ...stats.map(({ span, mean, sd }) => [span, mean.toFixed(3), sd.toFixed(3), batches, batchSize].join(','))
    ];
    fs.writeFileSync(path.join(root, 'results/latency_benchmark.csv'), csv.join('\n') + '\n');

    const rows = stats.map(({ label, mean, sd }) =>
        [label, mean.toFixed(3), sd.toFixed(3)].join(' & ') + String.raw`\\`);
    const tex = [
        String.raw`\begin{table}[!t]`,
        String.raw`\caption{Tiempo de verificación por tramo ($\mu\mathrm{s}$)}`,
        String.raw`\label{tab:latency_bench}`,
        String.raw`\centering\footnotesize`,
        String.raw`\begin{tabular}{lrr}`,
        String.raw`\hline`,
        String.raw`Tramo & Media & DE entre lotes\\\hline`,
        ...rows,
        String.raw`\hline`,
        String.raw`\end{tabular}`,
        String.raw`\end{table}`,
        ''
    ];
    fs.writeFileSync(path.join(root, 'paper_assets/tabla_v_latencia.tex'), tex.join('\n'));
    console.table(stats.map(({ span, mean, sd }) => ({ span, mean_us: mean, batch_sd_us: sd })));
    return { metadata, stats };
}

if (require.main === module) runBenchmark();

module.exports = { runBenchmark };
