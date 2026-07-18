import logging
import httpx
import os
import asyncio
import re
from typing import List, Dict, Optional, Any
from app.application.prompts.prompt_config import PromptConfig
from app.infrastructure.gateways.base_llm_gateway import BaseLLMGateway

logger = logging.getLogger(__name__)

class OllamaGateway(BaseLLMGateway):
    """
    Ollama / 9Router provider implementation with cascade fallback strategy.
    """
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.api_url = os.getenv("LLM_API_URL", "")
        raw_models = os.getenv("LLM_MODELS", "")
        self.models = [m.strip() for m in raw_models.split(",") if m.strip()]
        if not self.models:
            logger.warning("No LLM_MODELS configured for OllamaGateway.")

    async def generate(
        self,
        messages: List[Dict[str, str]],
        config: PromptConfig
    ) -> Optional[str]:
        if self.api_key == "your-api-key-here" or not self.api_url:
            logger.warning("Using mock gateway response.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        max_retries = 2
        for model_index, model in enumerate(self.models):
            logger.info(f"🤖 Trying model [{model_index + 1}/{len(self.models)}]: {model}")

            for attempt in range(1, max_retries + 1):
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": config.temperature,
                    "max_tokens": config.max_tokens,
                    "stream": False
                }

                try:
                    async with httpx.AsyncClient(timeout=180.0) as client:
                        response = await client.post(self.api_url, headers=headers, json=payload)

                        if response.status_code == 429:
                            wait_seconds = 5
                            try:
                                body = response.json()
                                msg = body.get("error", {}).get("message", "")
                                match = re.search(r"reset after (\d+)s", msg)
                                if match:
                                    wait_seconds = int(match.group(1)) + 1
                            except Exception:
                                pass

                            if attempt < max_retries:
                                logger.warning(f"[429] Model '{model}' rate limited. Retrying in {wait_seconds}s... (attempt {attempt}/{max_retries})")
                                await asyncio.sleep(wait_seconds)
                                continue
                            else:
                                logger.warning(f"[429] Model '{model}' exhausted retries. Trying next model...")
                                break

                        if response.status_code >= 500:
                            logger.warning(f"[{response.status_code}] Model '{model}' server error. Trying next model...")
                            break

                        if response.status_code != 200:
                            logger.error(f"LLM API Error [{model}]: {response.status_code} - {response.text}")
                            break

                        raw_text = response.text
                        if not raw_text or not raw_text.strip():
                            logger.error(f"LLM [{model}]: Empty response body (200 OK but blank). Trying next model.")
                            break

                        try:
                            data = response.json()
                        except Exception as parse_err:
                            logger.error(f"LLM [{model}]: Failed to parse JSON response. raw='{raw_text[:200]}' err={parse_err}")
                            break

                        choices = data.get("choices", [])
                        if not choices:
                            logger.error(f"LLM [{model}]: No choices in response. data={data}")
                            break

                        content = choices[0].get("message", {}).get("content", "")
                        if not content:
                            logger.error(f"LLM [{model}]: Empty content in choices[0].")
                            break

                        logger.info(f"✅ LLM success with model '{model}' on attempt {attempt}.")
                        return content

                except Exception as e:
                    logger.error(f"LLM call error [{model}]: {e}")
                    break

        logger.error("❌ All models exhausted.")
        return None

    async def generate_raw(
        self,
        messages: List[Dict[str, str]],
        config: PromptConfig
    ) -> Dict[str, Any]:
        if self.api_key == "your-api-key-here" or not self.api_url:
            logger.warning("Using mock gateway response.")
            return {"content": '{"days":[]}', "model": "mock", "prompt_tokens": 0, "completion_tokens": 0}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        max_retries = 2
        for model_index, model in enumerate(self.models):
            logger.info(f"🤖 Trying model [{model_index + 1}/{len(self.models)}]: {model}")

            for attempt in range(1, max_retries + 1):
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": config.temperature,
                    "max_tokens": config.max_tokens,
                    "stream": False
                }

                try:
                    async with httpx.AsyncClient(timeout=180.0) as client:
                        response = await client.post(self.api_url, headers=headers, json=payload)

                        if response.status_code == 429:
                            wait_seconds = 5
                            try:
                                body = response.json()
                                msg = body.get("error", {}).get("message", "")
                                match = re.search(r"reset after (\d+)s", msg)
                                if match:
                                    wait_seconds = int(match.group(1)) + 1
                            except Exception:
                                pass

                            if attempt < max_retries:
                                logger.warning(f"[429] Model '{model}' rate limited. Retrying in {wait_seconds}s... (attempt {attempt}/{max_retries})")
                                await asyncio.sleep(wait_seconds)
                                continue
                            else:
                                logger.warning(f"[429] Model '{model}' exhausted retries. Trying next model...")
                                break

                        if response.status_code >= 500:
                            logger.warning(f"[{response.status_code}] Model '{model}' server error. Trying next model...")
                            break

                        if response.status_code != 200:
                            logger.error(f"LLM API Error [{model}]: {response.status_code} - {response.text}")
                            break

                        raw_text = response.text
                        if not raw_text or not raw_text.strip():
                            logger.error(f"LLM [{model}]: Empty response body (200 OK but blank). Trying next model.")
                            break

                        try:
                            data = response.json()
                        except Exception as parse_err:
                            logger.error(f"LLM [{model}]: Failed to parse JSON response. raw='{raw_text[:200]}' err={parse_err}")
                            break

                        choices = data.get("choices", [])
                        if not choices:
                            logger.error(f"LLM [{model}]: No choices in response. data={data}")
                            break

                        content = choices[0].get("message", {}).get("content", "")
                        if not content:
                            logger.error(f"LLM [{model}]: Empty content in choices[0].")
                            break
                            
                        usage = data.get("usage", {})

                        logger.info(f"✅ LLM success with model '{model}' on attempt {attempt}.")
                        return {
                            "content": content,
                            "model": model,
                            "prompt_tokens": usage.get("prompt_tokens", 0),
                            "completion_tokens": usage.get("completion_tokens", 0)
                        }

                except Exception as e:
                    logger.error(f"LLM call error [{model}]: {e}")
                    break

        logger.error("❌ All models exhausted. Falling back to mock.")
        return {"content": '{"days":[]}', "model": "mock", "prompt_tokens": 0, "completion_tokens": 0}
