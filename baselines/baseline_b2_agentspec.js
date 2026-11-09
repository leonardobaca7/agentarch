/**
 * Línea Base B2: Reglas de Políticas al Estilo AgentSpec (Wang et al., ICSE 2026)
 * Reimplementación limpia basada en disparadores y predicados en la frontera de herramientas.
 * Intercepta nombres de herramientas y valida esquemas de argumentos.
 * Ciega ante: mutaciones de prompts (P1-P3), corrupción de memoria (M1-M3) e inversiones causales (Pi3).
 */

const { performance } = require('perf_hooks');

function evaluateB2(scenario, spec) {
    const start = performance.now();
    let detected = false;
    let firstStep = null;
    let violation = null;

    for (const span of scenario.spans) {
        if (span.name === 'agentarch.tool_call') {
            const agent = span.attr['agentarch.agent.id'];
            const tool = span.attr['agentarch.tool.name'];
            let args = {};
            try {
                args = typeof span.attr['agentarch.tool.args'] === 'string'
                    ? JSON.parse(span.attr['agentarch.tool.args'])
                    : span.attr['agentarch.tool.args'];
            } catch (e) {}

            // 1. Verificación de capacidades (Pi1)
            const allowed = (spec.Pi && spec.Pi.capabilities && spec.Pi.capabilities[agent]) || [];
            if (!allowed.includes(tool)) {
                detected = true;
                firstStep = span.step || 1;
                violation = 'Pi1';
                break;
            }

            // 2. Verificación de rangos y esquema de argumentos (Pi2)
            const validator = spec.Pi && spec.Pi.rules && spec.Pi.rules[tool];
            if (validator && !validator(args)) {
                detected = true;
                firstStep = span.step || 1;
                violation = 'Pi2';
                break;
            }
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

module.exports = { evaluateB2 };
