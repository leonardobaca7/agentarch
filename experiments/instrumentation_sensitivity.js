const fs = require('node:fs');
const { AgentArchSpanProcessor, sha256 } = require('../src/agentarch');
const { getSystemSpec } = require('../scenarios/scenario_loader');

// Fault injection in reported metadata; distinct from the live-model pilot.
const spec = getSystemSpec();
const canonical = spec.P.OrderTriage.hashes;
const rows = [];
for (const faithful of [true, false]) {
    const verifier = new AgentArchSpanProcessor(spec);
    const violations = verifier.onEnd({ name: 'agentarch.agent_turn', attr: {
        'agentarch.agent.id': 'OrderTriage',
        'agentarch.prompt.active_clause_ids': ['clause_auth', 'clause_scope_triage'],
        'agentarch.prompt.active_clause_hashes': [faithful ? sha256('ACTUALLY ALTERED AUTH TEXT') : canonical.clause_auth,
            canonical.clause_scope_triage]
    } });
    rows.push({ fault: 'altered_prompt_text', metadata: faithful ? 'faithful_changed_digest' : 'stale_canonical_digest',
        expectedActualOperator: 'P3', reportedOperators: violations.map(v => v.op) });
}
for (const faithful of [true, false]) {
    const verifier = new AgentArchSpanProcessor(spec);
    const violations = verifier.onEnd({ name: 'agentarch.memory_op', attr: {
        'agentarch.memory.op': 'write', 'agentarch.memory.key': 'unsupported_discount',
        'agentarch.memory.new_value': '50%', 'agentarch.memory.verified': !faithful,
        'agentarch.memory.timestamp': 0, 'agentarch.memory.ttl': 1000
    } });
    rows.push({ fault: 'unsupported_memory_write', metadata: faithful ? 'verified_false' : 'incorrect_verified_true',
        expectedActualOperator: 'M1', reportedOperators: violations.map(v => v.op) });
}
fs.writeFileSync('results/instrumentation_sensitivity.json', JSON.stringify(rows, null, 2) + '\n');
const descriptions = {
    faithful_changed_digest: 'Resumen del texto alterado',
    stale_canonical_digest: 'Resumen canónico obsoleto',
    verified_false: String.raw`\texttt{verified=false}`,
    incorrect_verified_true: String.raw`\texttt{verified=true} incorrecto`
};
const table = [String.raw`\begin{table}[!t]`,
    String.raw`\caption{Sensibilidad a la calidad de los metadatos}`,
    String.raw`\label{tab:metadata_quality}`, String.raw`\centering\footnotesize`,
    String.raw`\begin{tabular}{llc}`, String.raw`\hline`,
    String.raw`Fallo real & Metadato registrado & Alerta\\\hline`,
    ...rows.map(row => [row.expectedActualOperator === 'P3' ? '$P_3$' : '$M_1$',
        descriptions[row.metadata], row.reportedOperators.length ? 'Sí' : 'No'].join(' & ') + String.raw`\\`),
    String.raw`\hline`, String.raw`\end{tabular}`, String.raw`\end{table}`, ''].join('\n');
fs.writeFileSync('paper_assets/tabla_ix_metadatos.tex', table);
console.table(rows);
