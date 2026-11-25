const fs = require('node:fs');
const assert = require('node:assert/strict');
const { queryCases } = require('./benign_queries');
const dir = 'results/prospective_queries';
const records = fs.readFileSync(dir + '/records.jsonl', 'utf8').trim().split(/\r?\n/).map(JSON.parse);
const summary = JSON.parse(fs.readFileSync(dir + '/summary.json'));
const metadata = JSON.parse(fs.readFileSync(dir + '/metadata.json'));
assert.deepEqual(metadata.cases, queryCases);
assert.deepEqual(metadata.seeds, Array.from({ length: 30 }, (_, i) => 200 + i));
assert.equal(summary.attempted, 30);
assert.equal(records.length, summary.valid);
assert.equal(records.length + summary.errors.length, 30);
assert.equal(new Set(records.map(r => r.id)).size, records.length);
const byTemplate = Array.from({ length: 10 }, (_, i) => {
    const cases = queryCases.filter(c => c.templateId === i + 1);
    const group = records.filter(r => cases.some(c => c.id === r.caseId));
    return { template: i + 1, planned: cases.length, valid: group.length,
        conformant: group.filter(r => !r.labels.length).length,
        falsePositive: group.filter(r => !r.labels.length && r.AgentArch.detected).length,
        taskComplete: group.filter(r => r.task.completed).length };
});
const output = { attempted: 30, valid: records.length, errors: summary.errors,
    conformant: summary.observedConformant, drift: summary.observedDrift,
    FP: summary.metrics.AgentArch.FP, taskComplete: summary.taskCompleted,
    templates: 10, byTemplate,
    illustrativeUpper95: summary.metrics.AgentArch.FP === 0 && summary.observedConformant
        ? 1 - 0.05 ** (1 / summary.observedConformant) : null,
    inferenceLimit: 'Typed query-only interface specified before generation; clustered templates; not an estimate for unconstrained agents or an independent human-labelled set' };
output.quantityMismatches = records.filter(r => {
    const test = queryCases.find(c => c.id === r.caseId);
    const event = r.events.find(e => e.type === 'tool' && e.call.tool === 'verify_inventory');
    return !event?.result.ok || event.call.args.quantity !== test.quantity;
}).map(r => r.id);
fs.writeFileSync(dir + '/prospective_analysis.json', JSON.stringify(output, null, 2));
const macros = { QueryAttempted: 30, QueryValid: records.length, QueryConformant: output.conformant,
    QueryDrift: output.drift, QueryFalsePositive: output.FP, QueryComplete: output.taskComplete,
    QueryErrors: output.errors.length };
fs.writeFileSync('paper_assets/metricas_consultas.tex', Object.entries(macros)
    .map(([key, value]) => '\\newcommand{\\' + key + '}{' + value + '}').join('\n') + '\n');
fs.writeFileSync('paper_assets/tabla_consultas_prospectivas.tex', [String.raw`\begin{table}[!t]`,
    String.raw`\caption{Consultas prospectivas con interfaz tipada}`, String.raw`\label{tab:queries}\centering\footnotesize`,
    String.raw`\begin{tabular}{rrrrr}\hline`, String.raw`Plantilla & Válidas & Conformes & FP & Completas\\\hline`,
    ...byTemplate.map(r => [r.template, r.valid, r.conformant, r.falsePositive, r.taskComplete].join(' & ') + String.raw`\\`),
    String.raw`\hline\end{tabular}\end{table}`, ''].join('\n'));
console.log(JSON.stringify(output, null, 2));
