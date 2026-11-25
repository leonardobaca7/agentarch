const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { labelCalls, summarize } = require('./run_live_evaluation');

const directory = path.resolve(process.argv[2] || 'results/live_pilot');
const readLines = (name) => fs.readFileSync(path.join(directory, name), 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
const requests = readLines('requests.jsonl');
const records = readLines('records.jsonl');
const spans = readLines('spans.jsonl');
const audits = readLines('audit.jsonl');
const summary = JSON.parse(fs.readFileSync(path.join(directory, 'summary.json')));
assert.equal(summary.errors.length, 0);
assert.equal(requests.length, summary.attempted);
assert.equal(records.length, summary.valid);
assert.equal(new Set(records.map(r => r.traceId)).size, records.length);
for (const record of records) {
    const request = requests.find(r => r.id === record.id);
    assert.equal(request.httpStatus, 200);
    const response = JSON.parse(request.responseText);
    assert.equal(response.choices[0].finish_reason, 'stop');
    const calls = JSON.parse(response.choices[0].message.content).calls;
    assert.deepEqual(calls, record.calls, record.id + ' raw calls');
    assert.deepEqual(labelCalls(record.role, calls), record.labels, record.id + ' labels');
    const sessionSpans = spans.filter(s => s.traceId === record.traceId);
    const root = sessionSpans.find(s => s.name === 'agentarch.session');
    assert.ok(root);
    assert.equal(sessionSpans.filter(s => s.name === 'agentarch.agent_turn').length, 1);
    const tools = sessionSpans.filter(s => s.name === 'agentarch.tool_call');
    assert.equal(tools.length, calls.length);
    for (const [index, span] of tools.entries()) {
        assert.equal(span.parentSpanId, root.spanId);
        assert.equal(span.attributes['agentarch.step'], index + 2);
        assert.equal(span.attributes['agentarch.tool.name'], calls[index].tool);
        assert.deepEqual(JSON.parse(span.attributes['agentarch.tool.args']), calls[index].args);
        assert.ok(span.attributes['agentarch.tool.result']);
    }
    const found = audits.filter(a => a.trace_id === record.traceId);
    assert.equal(record.AgentArch.detected, found.length > 0);
    assert.equal(record.AgentArch.firstStep, found[0]?.step ?? null);
    const observedLabels = found.map(event => ({ step: event.step, operators: event.violations.map(v => v.op) }));
    assert.deepEqual(observedLabels, record.labels, record.id + ' complete operator and step matches');
}
for (const key of ['B1', 'B2', 'AgentArch']) {
    assert.deepEqual(summarize(records, key), summary.metrics[key]);
}
const distinct = new Set(records.map(r => JSON.stringify([r.role, r.calls]))).size;
console.log(`Verified ${requests.length} actual HTTP responses, ${spans.length} SDK spans, ${records.length} labels, ${distinct} distinct plans.`);
const table = [
    String.raw`\begin{table}[!t]`,
    String.raw`\caption{Piloto con inferencia local sobre 24 sesiones}`,
    String.raw`\label{tab:live}`,
    String.raw`\centering\footnotesize`,
    String.raw`\begin{tabular}{lrrrrr}`,
    String.raw`\hline`,
    String.raw`Variante & VP & FP & VN & FN & $t^*$ (\%)\\\hline`,
    ...Object.entries(summary.metrics).map(([key, value]) => [
        key === 'AgentArch' ? String.raw`\arch` : key === 'B1' ? '$B_1$' : '$B_2$',
        value.TP, value.FP, value.TN, value.FN, (100 * value.firstStepAccuracy).toFixed(0)
    ].join(' & ') + String.raw`\\`),
    String.raw`\hline`, String.raw`\end{tabular}`, String.raw`\end{table}`, ''
].join('\n');
fs.writeFileSync('paper_assets/tabla_vi_modelo.tex', table);
