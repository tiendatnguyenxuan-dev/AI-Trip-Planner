import logging
import httpx
import os
from typing import List, Dict, Optional, Any
from app.application.prompts.prompt_config import PromptConfig
from app.infrastructure.gateways.base_llm_gateway import BaseLLMGateway

logger = logging.getLogger(__name__)

class OpenAIGateway(BaseLLMGateway):
    """
    OpenAI provider gateway implementation.
    """
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.api_url = os.getenv("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")

    async def generate(
        self,
        messages: List[Dict[str, str]],
        config: PromptConfig
    ) -> Optional[str]:
        if not self.api_key:
            logger.warning("No OPENAI_API_KEY configured. OpenAIGateway is inactive.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": config.temperature,
            "max_tokens": config.max_tokens,
            "stream": False
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.api_url, headers=headers, json=payload)
                if response.status_code != 200:
                    logger.error(f"OpenAI API Error: {response.status_code} - {response.text}")
                    return None

                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                return content
        except Exception as e:
            logger.error(f"OpenAI call exception: {e}")
            return None

    async def generate_raw(
        self,
        messages: List[Dict[str, str]],
        config: PromptConfig
    ) -> Dict[str, Any]:
        content = await self.generate(messages, config)
        if not content:
            return {"content": "", "model": self.model, "prompt_tokens": 0, "completion_tokens": 0}
        return {"content": content, "model": self.model, "prompt_tokens": 0, "completion_tokens": 0}
