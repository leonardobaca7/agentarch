"""Adaptador para modelos de pesos abiertos locales (Ollama / vLLM / HuggingFace)."""

from typing import Optional
import urllib.request
import json

class LocalLLMAdapter:
    def __init__(self, endpoint: str = "http://localhost:11434/v1", model: str = "llama3.1:8b"):
        self.endpoint = endpoint
        self.model = model

    def generate_response(self, system_prompt: str, user_message: str, temperature: float = 0.0) -> str:
        url = f"{self.endpoint}/chat/completions"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "temperature": temperature
        }
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    return data["choices"][0]["message"]["content"]
        except Exception:
            pass
        return f"[SIMULATED_LLM_OUTPUT_{self.model}] Response to: {user_message}"
