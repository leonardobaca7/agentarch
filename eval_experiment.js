/**
 * AgentArch: Punto de entrada rápido para reproducción con un solo comando.
 * Ejecuta: node eval_experiment.js (o node experiments/run_evaluation.js)
 */

const { runFullEvaluation } = require('./experiments/run_evaluation');

if (require.main === module) {
    runFullEvaluation();
}

module.exports = { runFullEvaluation };
