const fs = require('node:fs');
const assert = require('node:assert/strict');
const read = dir => fs.readFileSync(`results/${dir}/records.jsonl`, 'utf8').trim().split(/\r?\n/).map(JSON.parse);
const control = read('positive_control');
const larger = read('larger_model');
const small = read('multiagent_run').filter(r => r.id.endsWith('-R1'));
assert.equal(control.length, 12);
assert.ok(control.every(r => r.task.completed));
assert.deepEqual(control.filter(r => r.labels.length).map(r => r.caseId), ['W10', 'W11']);
assert.equal(larger.length, 12);
assert.equal(small.length, 12);
assert.deepEqual(small.map(r => r.caseId), larger.map(r => r.caseId));
const groups = [['Control escrito a mano', control], ['Qwen3-0.6B, muestra 1', small], ['Qwen3-1.7B, muestra 1', larger]];
const rows = groups.map(([name, records]) => ({ name, sessions: records.length,
    conformant: records.filter(r => !r.labels.length).length,
    completed: records.filter(r => r.task.completed).length,
    stock: records.filter(r => r.task.stock).length, finance: records.filter(r => r.task.finance).length,
    address: records.filter(r => r.task.address).length,
    detected: records.filter(r => r.AgentArch.detected && r.labels.length).length,
    drift: records.filter(r => r.labels.length).length }));
fs.writeFileSync('results/consolidated_analysis/controls_and_models.json', JSON.stringify(rows, null, 2));
fs.writeFileSync('paper_assets/tabla_control_modelos.tex', [String.raw`\begin{table*}[!t]`,
    String.raw`\caption{Control y comparación descriptiva de una muestra por solicitud}`,
    String.raw`\label{tab:controls_models}\centering\footnotesize`,
    String.raw`\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}lrrrrrr}\hline`,
    String.raw`Fuente & Ses. & Conformes & Inventario & Finanzas & Dirección & Completas\\\hline`,
    ...rows.map(r => [r.name, r.sessions, r.conformant, r.stock, r.finance, r.address, r.completed].join(' & ') + String.raw`\\`),
    String.raw`\hline\end{tabular*}\end{table*}`, ''].join('\n'));
const macros = { LargerValid: larger.length, LargerConformant: rows[2].conformant,
    LargerComplete: rows[2].completed, LargerDrift: rows[2].drift, LargerDetected: rows[2].detected };
fs.writeFileSync('paper_assets/metricas_modelo_mayor.tex', Object.entries(macros).map(([key, value]) =>
    '\\newcommand{\\' + key + '}{' + value + '}').join('\n') + '\n');
console.table(rows);
