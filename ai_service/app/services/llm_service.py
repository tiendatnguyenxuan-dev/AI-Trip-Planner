import logging
import json
import re
import httpx
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

from app.application.prompts.prompt_registry import prompt_registry

class LLMService:
    def __init__(self):
        # 9Router / Ollama Config
        self.api_key = os.getenv("LLM_API_KEY", "")
        self.api_url = os.getenv("LLM_API_URL")
        if not self.api_url:
            logger.warning("⚠️ No LLM_API_URL configured in .env!")
            
        # LLM_MODELS: comma-separated list for cascade fallback
        # e.g: model1:free,model2:free,model3:free
        raw_models = os.getenv("LLM_MODELS", "")
        self.models = [m.strip() for m in raw_models.split(",") if m.strip()]
        if not self.models:
            logger.warning("⚠️ No LLM_MODELS configured in .env! LLM calls will use mock fallback.")


    async def call_llm_raw(self, messages: List[Dict[str, str]], max_retries: int = 2) -> Dict[str, Any]:
        """
        Calls the LLM API and returns raw string content + usage metrics.
        """
        import asyncio
        import re as _re

        if self.api_key == "your-api-key-here":
            logger.warning("No real API key found. Using mock behavior.")
            return {"content": '{"days":[]}', "model": "mock", "prompt_tokens": 0, "completion_tokens": 0}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        for model_index, model in enumerate(self.models):
            logger.info(f"🤖 Trying model [{model_index + 1}/{len(self.models)}]: {model}")

            for attempt in range(1, max_retries + 1):
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.2,
                    "max_tokens": 4000,
                    "stream": False
                }

                try:
                    async with httpx.AsyncClient(timeout=180.0) as client:
                        response = await client.post(self.api_url, headers=headers, json=payload)

                        if response.status_code == 429:
                            wait_seconds = 5
                            if attempt < max_retries:
                                await asyncio.sleep(wait_seconds)
                                continue
                            else:
                                break

                        if response.status_code >= 500:
                            break

                        if response.status_code != 200:
                            break

                        data = response.json()
                        choices = data.get("choices", [])
                        if not choices:
                            break

                        content = choices[0].get("message", {}).get("content", "")
                        if not content:
                            break
                            
                        usage = data.get("usage", {})

                        logger.info(f"✅ LLM success with model '{model}'.")
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

    async def call_llm(self, messages: List[Dict[str, str]], max_retries: int = 2) -> Dict[str, Any]:
        """
        Calls the LLM API with model cascade fallback.
        If a model fails (429 / 5xx), automatically tries the next model in the list.
        """
        import asyncio
        import re as _re

        if self.api_key == "your-api-key-here":
            logger.warning("No real API key found. Using mock behavior.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        for model_index, model in enumerate(self.models):
            logger.info(f"🤖 Trying model [{model_index + 1}/{len(self.models)}]: {model}")

            for attempt in range(1, max_retries + 1):
                # Note: response_format is NOT used — Ollama models via proxy don't support it
                # and it causes empty response body (200 OK but blank body)
                payload = {
                    "model": model,
                    "messages": messages,
                    "temperature": 0.2,
                    "max_tokens": 2000,
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
                                match = _re.search(r"reset after (\d+)s", msg)
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
                        return self._safe_parse(content)

                except Exception as e:
                    logger.error(f"LLM call error [{model}]: {e}")
                    break

        logger.error("❌ All models exhausted. Falling back to mock.")
        return None

    async def repair_entities(self, text: str, current_entities: Dict[str, Any], user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Use LLM to fill missing or misunderstood entities.
        """
        logger.info(f"LLM Fallback triggered for text: '{text}'")
        
        entities_json = json.dumps(current_entities, ensure_ascii=False, indent=2)
        user_profile_json = json.dumps(user_profile or {}, ensure_ascii=False, indent=2)
        
        messages = [
            {
                "role": "system",
                "content": "You are an AI travel assistant. Return ONLY valid JSON."
            },
            {
                "role": "user",
                "content": prompt_registry.get_prompt("repair_prompt").content.format(
                    text=text,
                    entities_json=entities_json,
                    user_profile_json=user_profile_json
                )
            }
        ]

        llm_output = await self.call_llm(messages)
        
        if not llm_output:
            # Fallback to previous mock logic if API fails
            logger.info("Using mock repair logic.")
            llm_output = {}
            if not current_entities.get("destination"):
                llm_output["destination"] = "Đà Lạt"
                llm_output["destination_is_suggested"] = True
            if not current_entities.get("vibe"):
                llm_output["vibe"] = "chill"

        repaired = self._merge_entities(current_entities, llm_output)
        
        # Post-processing normalization
        if repaired.get("budget"):
            repaired["budget"] = self._normalize_budget(repaired["budget"])
        if repaired.get("duration_days"):
            repaired["duration_days"] = self._normalize_duration(repaired["duration_days"])
            
        return repaired

    async def generate_itinerary(self, destination: str, duration_days: int, budget: int, vibe: str, group_type: str) -> Dict[str, Any]:
        """
        Use LLM to generate a full travel itinerary.
        """
        logger.info(f"LLM Itinerary Generation triggered for {destination}")
        
        prompt = prompt_registry.get_prompt("planner_prompt").content.format(
            destination=destination,
            duration_days=duration_days,
            budget=budget,
            vibe=vibe,
            group_type=group_type
        )
        
        messages = [
            {"role": "system", "content": "You are a travel planner AI. Return ONLY JSON."},
            {"role": "user", "content": prompt}
        ]

        llm_output = await self.call_llm(messages)
        
        if llm_output and "days" in llm_output:
            return llm_output
            
        # Mock fallback
        days = []
        for d in range(1, duration_days + 1):
            days.append({
                "day": d,
                "activities": [
                    f"Morning: Khám phá địa điểm nổi tiếng tại {destination}",
                    f"Afternoon: Trải nghiệm hoạt động mang phong cách {vibe}",
                    "Evening: Ăn tối và dạo phố tự do"
                ]
            })
        return {"days": days}

    def _safe_parse(self, content: str) -> Dict[str, Any]:
        try:
            return json.loads(content)
        except:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    return {}
        return {}

    def _merge_entities(self, original: Dict[str, Any], llm_output: Dict[str, Any]) -> Dict[str, Any]:
        merged = original.copy()
        for key, value in llm_output.items():
            # Only fill if missing OR if current is null
            if not merged.get(key) and value:
                merged[key] = value
        return merged

    def _normalize_budget(self, value):
        if isinstance(value, str):
            v = value.lower().replace(" ", "")
            if "triệu" in v:
                try: return int(float(v.replace("triệu", ""))) * 1_000_000
                except: pass
            if "tr" in v:
                try: return int(float(v.replace("tr", ""))) * 1_000_000
                except: pass
        return value

    def _normalize_duration(self, value):
        if isinstance(value, str):
            v = value.lower()
            if "ngày" in v:
                try: return int(v.split()[0])
                except: pass
        return value

llm_service = LLMService()
