const fs = require('node:fs');
const assert = require('node:assert/strict');
const { queryCases } = require('./benign_queries');
const { getSystemSpec } = require('../scenarios/scenario_loader');
const read = dir => fs.readFileSync(`results/${dir}/records.jsonl`, 'utf8').trim().split(/\r?\n/).map(JSON.parse);
const output = 'results/final_audit';
fs.mkdirSync(output, { recursive: true });
const typed = read('prospective_queries');
const events = typed.flatMap(r => r.events);
const spec = getSystemSpec();
const writes = events.filter(e => e.type === 'write');
const tools = events.filter(e => e.type === 'tool');
const scope = {
    sessions: typed.length, turns: events.filter(e => e.type === 'turn').length,
    initializationWrites: writes.filter(e => e.origin === 'initialization').length,
    modelWrites: writes.filter(e => e.origin === 'model').length,
    reads: events.filter(e => e.type === 'read').length,
    toolCalls: tools.length,
    precedenceTargets: tools.filter(e => ['reserve_stock', 'process_payment'].includes(e.call.tool)).length,
    forbiddenTools: tools.filter(e => !spec.Pi.capabilities[e.role].includes(e.call.tool)).length,
    invalidArguments: tools.filter(e => !spec.Pi.rules[e.call.tool]?.(e.call.args)).length,
    expiredKnownReads: 0,
    interpretation: {
        P1_P3: 'Canonical prompt integrity evaluated on turns; no prompt faults injected',
        P2: 'No active conflicting clause pairs',
        M1: 'Initialization write only; no model memory admission decisions',
        M2: 'No replacement attempts',
        M3: 'Known address reads before TTL; no expiry faults',
        Pi1_Pi2: 'Tool calls evaluated; decoding schema restricts names and argument types/ranges',
        Pi3: 'No reservation/payment targets; no precedence test'
    }
};
for (const record of typed) {
    const memory = new Map();
    for (const event of record.events) {
        if (event.type === 'write') memory.set(event.key, event);
        if (event.type === 'read' && memory.has(event.key)) {
            const prior = memory.get(event.key);
            if (event.timestamp - prior.timestamp > prior.ttl) scope.expiredKnownReads++;
        }
    }
}
assert.equal(scope.turns, 90);
assert.equal(scope.modelWrites, 0);
assert.equal(scope.precedenceTargets, 0);
fs.writeFileSync(output + '/typed_scope.json', JSON.stringify(scope, null, 2));
if (process.argv.includes('--typed-only')) { console.log(scope); process.exit(0); }
const free = read('free_queries');
const metadata = JSON.parse(fs.readFileSync('results/free_queries/metadata.json'));
const summary = JSON.parse(fs.readFileSync('results/free_queries/summary.json'));
assert.equal(metadata.caseSet, 'free_queries');
assert.deepEqual(metadata.cases, queryCases);
assert.deepEqual(metadata.seeds, Array.from({ length: 30 }, (_, i) => 200 + i));
assert.equal(summary.attempted, 30);
assert.equal(free.length + summary.errors.length, 30);
const rows = [['Tipada', typed], ['Esquema general', free]].map(([condition, records]) => ({
    condition, attempted: 30, valid: records.length, conformant: records.filter(r => !r.labels.length).length,
    drift: records.filter(r => r.labels.length).length,
    FP: records.filter(r => !r.labels.length && r.AgentArch.detected).length,
    taskCompleted: records.filter(r => r.task.completed).length,
    conformantIncomplete: records.filter(r => !r.labels.length && !r.task.completed).length
}));
const byTemplate = Array.from({ length: 10 }, (_, i) => {
    const ids = queryCases.filter(c => c.templateId === i + 1).map(c => c.id);
    const group = free.filter(r => ids.includes(r.caseId));
    return { template: i + 1, planned: ids.length, valid: group.length,
        conformant: group.filter(r => !r.labels.length).length, drift: group.filter(r => r.labels.length).length,
        completed: group.filter(r => r.task.completed).length };
});
const paired = typed.map(t => { const f = free.find(r => r.caseId === t.caseId);
    return { caseId: t.caseId, typedConformant: !t.labels.length,
        freeConformant: f ? !f.labels.length : null, typedTask: t.task.completed, freeTask: f?.task.completed ?? null }; });
const result = { protocolCommit: metadata.commit, rows, byTemplate, paired, errors: summary.errors,
    metrics: summary.metrics,
    limitation: 'Same domain, fixed roles, general JSON envelope, query instructions; automatic labels; descriptive comparison without population or causal inference' };
fs.writeFileSync(output + '/query_interfaces.json', JSON.stringify(result, null, 2));
const freeRow = rows[1];
const macros = { FreeAttempted: 30, FreeValid: freeRow.valid, FreeConformant: freeRow.conformant,
    FreeDrift: freeRow.drift, FreeFP: freeRow.FP, FreeComplete: freeRow.taskCompleted,
    FreeErrors: summary.errors.length, FreeConformantIncomplete: freeRow.conformantIncomplete,
    FreeDetected: summary.metrics.AgentArch.TP };
fs.writeFileSync('paper_assets/metricas_consultas_libres.tex', Object.entries(macros).map(([key,value]) =>
    '\\newcommand{\\'+key+'}{'+value+'}').join('\n')+'\n');
fs.writeFileSync('paper_assets/tabla_interfaces_consulta.tex', [String.raw`\begin{table*}[!t]`,
    String.raw`\caption{Consultas prospectivas con dos esquemas de generación}`,
    String.raw`\label{tab:query_interfaces}\centering\footnotesize`,
    String.raw`\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}lrrrrrr}\hline`,
    String.raw`Esquema & Intentos & Válidas & Conformes & Con infracción & FP & Completas\\\hline`,
    ...rows.map(r=>[r.condition,r.attempted,r.valid,r.conformant,r.drift,r.FP,r.taskCompleted].join(' & ')+String.raw`\\`),
    String.raw`\hline\end{tabular*}\end{table*}`, ''].join('\n'));
console.table(rows);
console.table(byTemplate);
