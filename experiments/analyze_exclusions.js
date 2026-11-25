const fs = require('node:fs');
const assert = require('node:assert/strict');
const records = fs.readFileSync('results/multiagent_run/records.jsonl', 'utf8').trim().split(/\r?\n/).map(JSON.parse);
const audits = fs.readFileSync('results/multiagent_run/audit.jsonl', 'utf8').trim().split(/\r?\n/).map(JSON.parse);
const output = 'results/consolidated_analysis';
fs.mkdirSync(output, { recursive: true });
const rows = [];
for (const excludeInjected of [false, true]) {
    for (const excludeM1 of [false, true]) {
        const group = records.filter(r => !excludeInjected || !['W10', 'W11'].includes(r.caseId));
        const row = { excludeInjected, excludeM1, sessions: group.length, drift: 0, conformant: 0,
            TP: 0, FP: 0, TN: 0, FN: 0, firstCorrect: 0, referencePairs: 0, detectedPairs: 0, extraPairs: 0 };
        for (const record of group) {
            const expected = record.labels.flatMap(l => l.operators.filter(op => !excludeM1 || op !== 'M1').map(op => ({ step: l.step, op })));
            const observed = audits.filter(a => a.trace_id === record.traceId).flatMap(a =>
                a.violations.filter(v => !excludeM1 || v.op !== 'M1').map(v => ({ step: a.step, op: v.op })));
            row.referencePairs += expected.length;
            row.detectedPairs += expected.filter(e => observed.some(a => a.op === e.op && a.step === e.step)).length;
            row.extraPairs += observed.filter(a => !expected.some(e => a.op === e.op && a.step === e.step)).length;
            if (expected.length) {
                row.drift++;
                row[observed.length ? 'TP' : 'FN']++;
                if (observed.length && Math.min(...observed.map(a => a.step)) === Math.min(...expected.map(e => e.step))) row.firstCorrect++;
            } else { row.conformant++; row[observed.length ? 'FP' : 'TN']++; }
        }
        rows.push(row);
    }
}
assert.equal(rows[0].referencePairs, 141);
fs.writeFileSync(output + '/exclusions.json', JSON.stringify(rows, null, 2));
const lines = [String.raw`\begin{table*}[!t]`, String.raw`\caption{Sensibilidad al excluir M1 y las sesiones con prompts perturbados}`,
    String.raw`\label{tab:exclusions}`, String.raw`\centering\footnotesize`,
    String.raw`\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}lrrrrrr}`, String.raw`\hline`,
    String.raw`Conjunto & Ses. & Con deriva & Conformes & VP & Pares coincidentes & $t^*$ correcto\\\hline`,
    ...rows.map(r => [(r.excludeInjected ? 'Sin W10/W11' : 'Todas') + (r.excludeM1 ? ', sin M1' : ''),
        r.sessions, r.drift, r.conformant, r.TP, r.detectedPairs + '/' + r.referencePairs, r.firstCorrect + '/' + r.drift].join(' & ') + String.raw`\\`),
    String.raw`\hline\end{tabular*}\end{table*}`, ''];
fs.writeFileSync('paper_assets/tabla_exclusiones.tex', lines.join('\n'));

// Deterministic review sample: all three conformant sessions plus seven cases.
const ids = records.filter(r => !r.labels.length).map(r => r.id)
    .concat(['W01-R1', 'W04-R1', 'W07-R1', 'W08-R1', 'W09-R1', 'W10-R1', 'W11-R1']);
assert.equal(new Set(ids).size, 10);
const packet = ids.map(id => {
    const record = records.find(r => r.id === id);
    assert.ok(record);
    return { id, caseId: record.caseId, stages: record.stages, events: record.events,
        finalMemory: record.finalMemory, humanReviewer: null, humanLabels: null, humanTaskOutcome: null };
});
fs.writeFileSync(output + '/human_review_packet.json', JSON.stringify({
    status: 'pending_human_review', selection: 'all 3 conformant sessions plus first sample of W01,W04,W07,W08,W09,W10,W11',
    instruction: 'Annotate events using the published specification before inspecting monitor labels. A person must identify and sign their review.',
    sessions: packet }, null, 2));
console.table(rows);
