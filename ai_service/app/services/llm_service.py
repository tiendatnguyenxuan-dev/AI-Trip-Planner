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
from app.infrastructure.gateways.base_llm_gateway import BaseLLMGateway
from app.infrastructure.gateways.ollama_gateway import OllamaGateway

class LLMService:
    def __init__(self, gateway: BaseLLMGateway = None):
        self.gateway = gateway or OllamaGateway()

    async def repair_entities(self, text: str, current_entities: Dict[str, Any], user_profile: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Use LLM to fill missing or misunderstood entities.
        """
        logger.info(f"LLM Fallback triggered for text: '{text}'")
        
        entities_json = json.dumps(current_entities, ensure_ascii=False, indent=2)
        user_profile_json = json.dumps(user_profile or {}, ensure_ascii=False, indent=2)
        
        prompt_obj = prompt_registry.get_prompt("repair_prompt")
        messages = [
            {
                "role": "system",
                "content": "You are an AI travel assistant. Return ONLY valid JSON."
            },
            {
                "role": "user",
                "content": prompt_obj.render(
                    text=text,
                    entities_json=entities_json,
                    user_profile_json=user_profile_json
                )
            }
        ]

        raw_response = await self.gateway.generate(messages, prompt_obj.config)
        llm_output = self._safe_parse(raw_response) if raw_response else {}
        
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
        
        prompt_obj = prompt_registry.get_prompt("planner_prompt")
        prompt = prompt_obj.render(
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

        raw_response = await self.gateway.generate(messages, prompt_obj.config)
        llm_output = self._safe_parse(raw_response) if raw_response else None
        
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

    async def call_llm_raw(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Backwards-compatible bridge for /chat endpoint.
        """
        chat_prompt = prompt_registry.get_prompt("chat_prompt")
        return await self.gateway.generate_raw(messages, chat_prompt.config)

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
