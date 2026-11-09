/**
 * Adaptador para modelos de pesos abiertos locales (Ollama / vLLM / HuggingFace).
 * Permite evaluar el agente contra LLaMA-3.1-8B-Instruct o Qwen2.5-7B en endpoints locales.
 */

class LocalLLMAdapter {
    constructor(endpoint = 'http://localhost:11434/v1', model = 'llama3.1:8b') {
        this.endpoint = endpoint;
        this.model = model;
    }

    async generateResponse(systemPrompt, userMessage, temperature = 0.0) {
        // En ausencia de endpoint local activo, recurre a generador sintético determinista
        try {
            const res = await fetch(`${this.endpoint}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    temperature
                })
            });
            if (res.ok) {
                const data = await res.json();
                return data.choices[0].message.content;
            }
        } catch (e) {
            // Fallback a modo simulado
        }
        return `[SIMULATED_LLM_OUTPUT_${this.model}] Response to: ${userMessage}`;
    }
}

module.exports = { LocalLLMAdapter };
