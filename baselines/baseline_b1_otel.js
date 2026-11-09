/**
 * Línea Base B1: Observabilidad Pasiva Estándar OpenTelemetry
 * Monitorea únicamente códigos de estado HTTP / RPC y excepciones no controladas.
 * Carece de un modelo formal explícito B = <P, M, Pi>.
 */

const { performance } = require('perf_hooks');

function evaluateB1(scenario) {
    const start = performance.now();
    let detected = false;
    let firstStep = null;
    let violation = null;

    // Solo inspecciona si ocurrió un fallo a nivel de transporte/servidor (HTTP >= 500)
    for (const span of scenario.spans) {
        if (span.attr && span.attr['http.status_code'] >= 500) {
            detected = true;
            firstStep = span.step || 1;
            violation = 'HTTP_500_ERROR';
            break;
        }
    }

    const elapsedUs = (performance.now() - start) * 1000;
    return {
        detected,
        firstStep,
        violation,
        elapsedUs
    };
}

module.exports = { evaluateB1 };
