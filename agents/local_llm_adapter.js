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
        const res = await fetch(`${this.endpoint}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    temperature,
                    max_tokens: 512
                }),
                signal: AbortSignal.timeout(180000)
            });
        if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${await res.text()}`);
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (typeof content !== 'string') throw new Error('LLM response lacks message content');
        return content;
    }
}

module.exports = { LocalLLMAdapter };
