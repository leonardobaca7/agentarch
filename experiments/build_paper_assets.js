const fs = require('node:fs');
const assert = require('node:assert/strict');
const load = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const row = cells => cells.join(' & ') + String.raw`\\`;
const table = (caption, label, columns, header, rows, wide = true) => [
    '\\begin{' + (wide ? 'table*' : 'table') + '}[!t]', String.raw`\caption{` + caption + '}',
    String.raw`\label{` + label + '}', String.raw`\centering\footnotesize`,
    String.raw`\setlength{\tabcolsep}{3pt}`,
    '\\begin{tabular*}{' + (wide ? '\\textwidth' : '\\columnwidth') + '}{@{\\extracolsep{\\fill}}' + columns + '}',
    String.raw`\hline`, row(header), String.raw`\hline`, ...rows.map(row),
    '\\hline\\end{tabular*}\\end{' + (wide ? 'table*' : 'table') + '}', ''
].join('\n');
const cohorts = [
    ['Piloto por rol', '8 solicitudes', 'live_pilot'],
    ['Flujo de pedidos, 0.6B', '12 solicitudes', 'multiagent_run'],
    ['Flujo de pedidos, 1.7B', '12 solicitudes', 'larger_model'],
    ['Control escrito a mano', '12 solicitudes', 'positive_control'],
    ['Consulta tipada', '10 plantillas', 'prospective_queries'],
    ['Consulta con esquema general', '10 plantillas', 'free_queries']
];
const cohortRows = cohorts.map(([name, units, dir]) => {
    const s = load(`results/${dir}/summary.json`);
    assert.equal(s.valid + s.errors.length, s.attempted);
    const conformant = s.observedConformant ?? s.observedConformantSessions;
    assert.ok(Number.isInteger(conformant));
    return [name, units, s.valid, conformant, dir === 'live_pilot' ? '--' : s.taskCompleted];
});
fs.writeFileSync('paper_assets/editorial_cohorts.tex', table(
    'Sesiones válidas, conformidad y finalización por conjunto', 'tab:cohorts', 'llrrr',
    ['Conjunto', 'Unidades de entrada', 'Sesiones', 'Conformes', 'Completas'], cohortRows));
const scripted = load('results/summary_metrics.json');
const names = { B1: '$B_1$', B2: '$B_2$', B_prop: 'AgentArch', AgentArch: 'AgentArch' };
const detectionRows = [];
for (const [label, count, metrics, keys] of [
    ['Guionizado', 40, scripted.metrics, ['B1', 'B2', 'B_prop']],
    ['Pedidos, 0.6B', 57, load('results/multiagent_run/summary.json').metrics, ['B1', 'B2', 'AgentArch']],
    ['Pedidos, 1.7B', 12, load('results/larger_model/summary.json').metrics, ['B1', 'B2', 'AgentArch']],
    ['Control manual', 2, load('results/positive_control/summary.json').metrics, ['B1', 'B2', 'AgentArch']],
    ['Consulta general', 26, load('results/free_queries/summary.json').metrics, ['B1', 'B2', 'AgentArch']]
]) {
    for (const [index, key] of keys.entries()) {
        const m = metrics[key];
        assert.equal(m.TP + m.FN, count);
        const first = 'tStarAcc' in m ? Math.round(m.tStarAcc * count / 100) : Math.round(m.firstStepAccuracy * count);
        detectionRows.push([index ? '' : label, names[key], m.TP, m.FP, m.TN, m.FN, `${first}/${count}`]);
    }
}
fs.writeFileSync('paper_assets/editorial_detection.tex', table(
    'Detección y primer paso. Referencia: etiquetas preparadas en guionizados; anotador automático en los demás conjuntos', 'tab:detection', 'llrrrrr',
    ['Conjunto', 'Variante', 'VP', 'FP', 'VN', 'FN', 'Primer paso'], detectionRows, false));
const exclusions = load('results/consolidated_analysis/exclusions.json');
fs.writeFileSync('paper_assets/editorial_exclusions.tex', table(
    'Sensibilidad a M1 y a las perturbaciones de prompt', 'tab:exclusions', 'lrrrrr',
    ['Reglas y sesiones', 'Sesiones', 'Con deriva', 'Conformes', 'Pares coincidentes', 'Primer paso'], exclusions.map(r => [
        (r.excludeInjected ? 'Sin W10/W11' : 'Todas') + (r.excludeM1 ? ', sin M1' : ''),
        r.sessions, r.drift, r.conformant, `${r.detectedPairs}/${r.referencePairs}`, `${r.firstCorrect}/${r.drift}`
    ])));
const core = load('results/latency_paths/measurements.json').stats;
const supplement = load('results/latency_supplement/measurements.json').stats;
const times = [...core.map(r => ({ ...r, alert: r.path === 'alert' })), ...supplement];
for (const r of times) {
    assert.equal(r.samples.length, 100);
    assert.ok(r.min <= r.median && r.median <= r.p95 && r.p95 <= r.p99);
}
fs.writeFileSync('paper_assets/editorial_times.tex', table(
    String.raw`Tiempo por llamada ($\mu\mathrm{s}$): estadísticos de cien medias de lote`, 'tab:times', 'llrrrrrr',
    ['Entrada', 'Camino', 'Media', 'DE', 'Mínimo', 'Mediana', 'p95', 'p99'], times.map(r => [
        r.name === 'Memoria' ? 'Escritura' : r.name, r.alert ? 'Con alerta' : 'Conforme', ...[r.mean, r.sd, r.min, r.median, r.p95, r.p99].map(v => v.toFixed(3).replace('.', ','))
    ])));
console.log('Generated four manuscript tables from preserved result files.');
