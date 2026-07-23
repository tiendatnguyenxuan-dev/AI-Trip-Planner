import logging
from typing import Dict, Any, List, Optional
from app.application.nodes.base_node import BaseNode
from app.shared.context.trip_context import TripContext

logger = logging.getLogger(__name__)

class ModificationPlanningNode(BaseNode):
    """
    Node responsible for processing contextual user modification prompts and generating
    partial itinerary updates, reusing candidate places, route matrices, weather & budget context from TravelIntelligenceNode.
    """
    def __init__(self, timeline_optimizer=None, llm_service=None):
        self.timeline_optimizer = timeline_optimizer
        self.llm_service = llm_service

    @property
    def name(self) -> str:
        return "ModificationPlanningNode"

    async def execute(self, context: TripContext) -> None:
        user_prompt = context.metadata.get("user_prompt") or context.request.get("text", "")
        modification_scope = context.metadata.get("modification_scope", "GENERAL")
        existing_trip = context.metadata.get("existing_trip", {})

        logger.info(f"ModificationPlanningNode executing for scope: {modification_scope}")

        # Extract targeted day if scope indicates a specific day (e.g., REGENERATE_DAY_2)
        target_day = None
        if "DAY_" in modification_scope.upper():
            try:
                target_day = int(modification_scope.upper().split("DAY_")[1])
            except Exception:
                pass

        partial_update: Dict[str, Any] = {}
        modified_items: List[str] = []

        # If context has travel intelligence and candidate places, run deterministic optimization for target day
        if context.travel_intelligence and self.timeline_optimizer and context.candidate_places:
            places = context.candidate_places.places
            
            if target_day:
                optimized_acts = await self.timeline_optimizer.optimize_daily_timeline(
                    day_number=target_day,
                    candidate_places=places,
                    route_matrix=context.travel_intelligence.route_matrix,
                    weather=context.travel_intelligence.weather_forecast[0] if context.travel_intelligence.weather_forecast else None
                )
                activities_list = [
                    f"[{act.suggested_start_time} - {act.suggested_end_time}] {act.place_name} "
                    f"(Transit: {act.transit_from_previous_mins}m, {act.distance_from_previous_km}km)"
                    for act in optimized_acts
                ]
                partial_update["days"] = [{
                    "day": target_day,
                    "summary": f"Lịch trình cập nhật cho Ngày {target_day}",
                    "activities": activities_list
                }]
                modified_items.append(f"Regenerated Day {target_day}")
            else:
                # Default targeted modification response
                partial_update["days"] = [{
                    "day": 1,
                    "summary": "Lịch trình đã được cập nhật theo yêu cầu",
                    "activities": [f"Hoạt động cập nhật: {user_prompt}"]
                }]
                modified_items.append("Modified itinerary items")

        context.metadata["partial_update"] = partial_update
        context.metadata["modification_summary"] = f"Đã cập nhật lịch trình theo yêu cầu: {user_prompt}"
