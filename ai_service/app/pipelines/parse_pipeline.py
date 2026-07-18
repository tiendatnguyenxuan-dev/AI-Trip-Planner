import logging
from app.services.entity_extractor import entity_extractor
from app.services.intent_service import intent_service
from app.services.classifier_service import classifier_service
from app.services.confidence_service import confidence_service
from app.services.llm_service import llm_service
from app.services.data_service import data_service
from app.models.schemas import ParseResponse, EntityResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from typing import Dict, Any
import datetime
from datetime import timedelta

from app.shared.context.trip_context import TripContext

class ParsePipeline:
    async def execute(self, context: TripContext) -> ParseResponse:
        """
        Execute the full parsing pipeline.
        """
        text = context.request["text"]
        user_id = context.request["user_id"]
        logger.info(f"--- Processing Query: '{text}' for user: {user_id} ---")
        
        # In a real app, fetch user_profile from DB using user_id
        user_profile = {} 
        # (Chỗ này sau này bạn có thể viết code fetch DB thực tế)
        
        # 1. Layer 1: Extract Entities (Regex)
        entities_dict = entity_extractor.extract(text)
        logger.info(f"Layer 1 (Regex) Entities: {entities_dict}")
        
        # 2. Classify Intent
        intent = intent_service.classify(text)
        logger.info(f"Intent Classified: {intent}")
        
        # 3. Layer 2: Lightweight Classification
        classification_result = classifier_service.classify(text)
        logger.info(f"Layer 2 (Classifier) Result: {classification_result}")
        
        # Merge Layer 2 results into entities
        if classification_result["vibe"] and not entities_dict.get("vibe"):
            entities_dict["vibe"] = classification_result["vibe"]
        entities_dict["group_type"] = classification_result["group_type"]
        
        # 4. Confidence Check
        confidence, needs_llm = confidence_service.calculate_confidence(
            entities=entities_dict, 
            classifier_score=classification_result["confidence"]
        )
        logger.info(f"Confidence Score: {confidence:.2f} | Needs LLM: {needs_llm}")
        
        # --- DATASET FALLBACK LOGIC ---
        destination = entities_dict.get("destination")
        if destination and data_service.get_destination_data(destination):
            logger.info(f"Destination '{destination}' found in dataset. Bypassing LLM repair.")
            needs_llm = False
        
        source = "regex | hybrid"
        
        # 5. Layer 3: LLM Repair (Fallback)
        if needs_llm:
            entities_dict = await llm_service.repair_entities(text, entities_dict, user_profile)
            source = "hybrid | llm"
            # Even if LLM repairs it, we might keep the confidence score as it was before repair, 
            # or optionally boost it. For now, keep it to show why it fell back.
        
        # --- DATE CALCULATION LOGIC ---
        time_str = (entities_dict.get("time") or "").lower()
        duration = entities_dict.get("duration_days") or 1
        
        # Check if user mentioned multiple dates (e.g., "mai đi, mốt về")
        raw_text = text.lower()
        start_date_obj = datetime.date.today()
        
        # Determine Start Date
        if "ngày mai" in raw_text or "hôm sau" in raw_text:
            start_date_obj += timedelta(days=1)
        elif "ngày mốt" in raw_text or "ngày kia" in raw_text:
            start_date_obj += timedelta(days=2)
        elif "ngày kìa" in raw_text:
            start_date_obj += timedelta(days=3)
        elif "tuần sau" in raw_text or "tuần tới" in raw_text:
            start_date_obj += timedelta(days=7)
        elif "tháng sau" in raw_text or "tháng tới" in raw_text:
            start_date_obj += timedelta(days=30)

        # Infer Duration if not extracted
        if duration == 1:
            if "ngày mốt" in raw_text or "ngày kia" in raw_text:
                if "về" in raw_text or "đến" in raw_text:
                    # If start was "mai" (+1) and return is "mốt" (+2), duration is 2
                    if "ngày mai" in raw_text:
                        duration = 2
                    # If start was "today" and return is "mốt" (+2), duration is 3
                    else:
                        duration = 3
            elif "ngày kìa" in raw_text:
                if "về" in raw_text or "đến" in raw_text:
                    if "ngày mai" in raw_text: duration = 3
                    elif "ngày mốt" in raw_text or "ngày kia" in raw_text: duration = 2
                    else: duration = 4
            
        entities_dict["start_date"] = start_date_obj.isoformat()
        entities_dict["end_date"] = (start_date_obj + timedelta(days=max(0, duration - 1))).isoformat()

        # --- TRAVELER MAPPING ---
        if not entities_dict.get("travelers"):
            group_type = (entities_dict.get("group_type") or "").lower()
            if "một mình" in group_type or "solo" in group_type:
                entities_dict["travelers"] = 1
            elif "hai người" in group_type:
                entities_dict["travelers"] = 2
            elif "cặp đôi" in group_type or "couple" in group_type:
                entities_dict["travelers"] = 2
            elif "gia đình" in group_type:
                entities_dict["travelers"] = 4 # Default for family
            else:
                entities_dict["travelers"] = 2 # Global default

        # 6. Build Response
        response = ParseResponse(
            intent=intent,
            entities=EntityResponse(**entities_dict),
            confidence=round(confidence, 2),
            source=source
        )
        context.parsed_query = response
        return response

parse_pipeline = ParsePipeline()
