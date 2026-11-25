/**
 * Ejecutor principal de evaluación experimental y generación de artefactos.
 * Reproduce la evaluación completa de los 50 escenarios para B1, B2 y B_prop.
 */

const fs = require('fs');
const path = require('path');
const { AgentArchSpanProcessor } = require('../src/agentarch/index');
const { evaluateB1 } = require('../baselines/baseline_b1_otel');
const { evaluateB2 } = require('../baselines/baseline_b2_agentspec');
const { loadAllScenarios } = require('../scenarios/scenario_loader');
const { runBenchmark } = require('./benchmark_latency');

function runFullEvaluation() {
    const { spec, scenarios } = loadAllScenarios();
    console.log(`=== AGENTARCH: EVALUACION EXPERIMENTAL COMPLETA (${scenarios.length} ESCENARIOS) ===\n`);

    const results = {
        B1: { TP: 0, FP: 0, TN: 0, FN: 0, tStarCorrect: 0, byCat: {} },
        B2: { TP: 0, FP: 0, TN: 0, FN: 0, tStarCorrect: 0, byCat: {} },
        BProp: { TP: 0, FP: 0, TN: 0, FN: 0, tStarCorrect: 0, byCat: {} }
    };

    ['Nominal', 'Prompt', 'Memory', 'Policy'].forEach(cat => {
        results.B1.byCat[cat] = { TP: 0, FP: 0, TN: 0, FN: 0, total: 0 };
        results.B2.byCat[cat] = { TP: 0, FP: 0, TN: 0, FN: 0, total: 0 };
        results.BProp.byCat[cat] = { TP: 0, FP: 0, TN: 0, FN: 0, total: 0 };
    });

    const scenarioRows = [
        'scenario_id,category,operator,expected_drift,expected_step,b1_detected,b2_detected,bprop_detected,bprop_first_step,bprop_first_op'
    ];

    for (const sc of scenarios) {
        const cat = sc.category;
        results.B1.byCat[cat].total++;
        results.B2.byCat[cat].total++;
        results.BProp.byCat[cat].total++;

        // 1. Evaluar B1
        const resB1 = evaluateB1(sc);
        if (sc.expectedDrift) {
            if (resB1.detected) {
                results.B1.TP++;
                results.B1.byCat[cat].TP++;
                if (resB1.firstStep === sc.expectedStep) results.B1.tStarCorrect++;
            } else {
                results.B1.FN++;
                results.B1.byCat[cat].FN++;
            }
        } else {
            if (resB1.detected) {
                results.B1.FP++;
                results.B1.byCat[cat].FP++;
            } else {
                results.B1.TN++;
                results.B1.byCat[cat].TN++;
            }
        }

        // 2. Evaluar B2
        const resB2 = evaluateB2(sc, spec);
        if (sc.expectedDrift) {
            if (resB2.detected) {
                results.B2.TP++;
                results.B2.byCat[cat].TP++;
                if (resB2.firstStep === sc.expectedStep) results.B2.tStarCorrect++;
            } else {
                results.B2.FN++;
                results.B2.byCat[cat].FN++;
            }
        } else {
            if (resB2.detected) {
                results.B2.FP++;
                results.B2.byCat[cat].FP++;
            } else {
                results.B2.TN++;
                results.B2.byCat[cat].TN++;
            }
        }

        // 3. Evaluar BProp (AgentArch)
        const verifier = new AgentArchSpanProcessor(spec);
        let bpropDetected = false;
        let bpropFirstStep = null;
        let bpropFirstOp = null;

        for (const span of sc.spans) {
            const viols = verifier.onEnd(span);

            if (viols && viols.length > 0 && !bpropDetected) {
                bpropDetected = true;
                bpropFirstStep = span.step || 1;
                bpropFirstOp = viols[0].op;
            }
        }

        if (sc.expectedDrift) {
            if (bpropDetected) {
                results.BProp.TP++;
                results.BProp.byCat[cat].TP++;
                if (bpropFirstStep === sc.expectedStep) results.BProp.tStarCorrect++;
            } else {
                results.BProp.FN++;
                results.BProp.byCat[cat].FN++;
            }
        } else {
            if (bpropDetected) {
                results.BProp.FP++;
                results.BProp.byCat[cat].FP++;
            } else {
                results.BProp.TN++;
                results.BProp.byCat[cat].TN++;
            }
        }

        scenarioRows.push(
            `${sc.id},${sc.category},${sc.operator},${sc.expectedDrift},${sc.expectedStep || ''},${resB1.detected},${resB2.detected},${bpropDetected},${bpropFirstStep || ''},${bpropFirstOp || ''}`
        );
    }

    function calcMetrics(m) {
        const prec = (m.TP + m.FP > 0) ? (m.TP / (m.TP + m.FP)) : 0;
        const rec = (m.TP + m.FN > 0) ? (m.TP / (m.TP + m.FN)) : 0;
        const f1 = (prec + rec > 0) ? (2 * prec * rec / (prec + rec)) : 0;
        const fpr = (m.FP + m.TN > 0) ? (m.FP / (m.FP + m.TN)) : 0;
        const tStarAcc = (m.TP + m.FN > 0) ? (m.tStarCorrect / (m.TP + m.FN)) : 0;
        return {
            TP: m.TP, FP: m.FP, TN: m.TN, FN: m.FN,
            Precision: +(prec * 100).toFixed(1),
            Recall: +(rec * 100).toFixed(1),
            F1: +(f1 * 100).toFixed(1),
            FPR: +(fpr * 100).toFixed(1),
            tStarAcc: +(tStarAcc * 100).toFixed(1)
        };
    }

    const b1Metrics = calcMetrics(results.B1);
    const b2Metrics = calcMetrics(results.B2);
    const bPropMetrics = calcMetrics(results.BProp);

    console.log('Resultados Globales:');
    console.log('  B1 (HTTP >= 500):', b1Metrics);
    console.log('  B2 (inspirada en AgentSpec):  ', b2Metrics);
    console.log('  B_prop (AgentArch):', bPropMetrics);
    console.log('');

    // Guardar resultados por escenario en CSV
    const csvPath = path.join(__dirname, '../results/scenario_results.csv');
    fs.writeFileSync(csvPath, scenarioRows.join('\n'), 'utf8');

    // Guardar resumen en JSON
    const summaryPath = path.join(__dirname, '../results/summary_metrics.json');
    const summaryData = {
        total_scenarios: scenarios.length,
        metrics: {
            B1: b1Metrics,
            B2: b2Metrics,
            B_prop: bPropMetrics
        },
        by_category: {
            B1: results.B1.byCat,
            B2: results.B2.byCat,
            B_prop: results.BProp.byCat
        }
    };
    fs.writeFileSync(summaryPath, JSON.stringify(summaryData, null, 2), 'utf8');

    const rows = Object.entries(summaryData.metrics);
    const tableRow = (cells) => cells.join(' & ') + String.raw`\\`;
    const table = (caption, label, alignment, header, body, wide = false) => [
        wide ? String.raw`\begin{table*}[!t]` : String.raw`\begin{table}[H]`,
        String.raw`\caption{` + caption + '}',
        String.raw`\label{` + label + '}',
        String.raw`\centering\footnotesize\setlength{\tabcolsep}{3pt}`,
        wide ? String.raw`\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}` + alignment + '}'
            : String.raw`\begin{tabular}{` + alignment + '}',
        String.raw`\hline`,
        tableRow(header),
        String.raw`\hline`,
        ...body.map(tableRow),
        String.raw`\hline`,
        wide ? String.raw`\end{tabular*}` : String.raw`\end{tabular}`,
        wide ? String.raw`\end{table*}` : String.raw`\end{table}`,
        ''
    ].join('\n');
    const names = { B1: '$B_1$', B2: '$B_2$', B_prop: 'AgentArch' };
    const categoryRows = rows.map(([id]) => [
        names[id],
        ...['Prompt', 'Memory', 'Policy'].map((category) => {
            const { TP, FN } = summaryData.by_category[id][category];
            return String(TP) + '/' + (TP + FN);
        })
    ]);
    const globalRows = rows.map(([id, m]) => [
        names[id], m.TP, m.FP, m.FN, m.TP + m.FP ? m.Precision : '--',
        m.Recall, m.F1, m.tStarAcc
    ]);
    const texTable = table('Casos detectados por dimensión', 'tab:category_results', 'lrrr',
        ['Variante', 'Prompts', 'Memoria', 'Políticas'], categoryRows)
        + table(String.raw`Resultados globales (métricas en \%)`, 'tab:experimental_results', 'lrrrrrrr',
            ['Variante', 'VP', 'FP', 'FN', 'Prec.', 'Exh.', '$F_1$', '$t^*$'], globalRows);
    fs.writeFileSync(path.join(__dirname, '../paper_assets/tabla_iv_resultados.tex'), texTable, 'utf8');

    // Ejecutar benchmark de latencia
    const bench = runBenchmark(50000);

    console.log('✓ Artefactos generados exitosamente en results/ y paper_assets/');
    return { summaryData, bench };
}

if (require.main === module) {
    runFullEvaluation();
}

module.exports = { runFullEvaluation };
