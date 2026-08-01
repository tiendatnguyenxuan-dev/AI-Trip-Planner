import logging
from typing import Dict, Any
from app.models.conversational_schemas import TripDraft, SlotValue, SlotSource
from app.pipelines.parse_pipeline import parse_pipeline
from app.shared.context.trip_context import TripContext

logger = logging.getLogger(__name__)

class IncrementalParser:
    """
    Parses newly provided information from the user message and updates TripDraft.
    """

    async def update_draft(self, draft: TripDraft, user_message: str, msg_index: int) -> TripDraft:
        try:
            context = TripContext(user_message, None)
            parsed_result = await parse_pipeline.execute(context)
            entities = parsed_result.entities

            # Extract destination
            if entities.destination and not entities.destination_is_suggested:
                draft.destination = SlotValue(
                    value=entities.destination,
                    confidence=parsed_result.confidence,
                    source=SlotSource.USER_EXPLICIT,
                    msg_index=msg_index
                )

            # Extract duration_days
            if entities.duration_days and entities.duration_days > 0:
                draft.duration_days = SlotValue(
                    value=entities.duration_days,
                    confidence=parsed_result.confidence,
                    source=SlotSource.USER_EXPLICIT,
                    msg_index=msg_index
                )

            # Extract budget
            if entities.budget and entities.budget > 0:
                draft.budget = SlotValue(
                    value=entities.budget,
                    confidence=parsed_result.confidence,
                    source=SlotSource.USER_EXPLICIT,
                    msg_index=msg_index
                )

            # Extract group_type
            if entities.group_type:
                draft.group_type = SlotValue(
                    value=entities.group_type,
                    confidence=parsed_result.confidence,
                    source=SlotSource.USER_EXPLICIT,
                    msg_index=msg_index
                )

            # Extract travel_style / vibe
            if entities.vibe:
                draft.travel_style = SlotValue(
                    value=entities.vibe,
                    confidence=parsed_result.confidence,
                    source=SlotSource.USER_EXPLICIT,
                    msg_index=msg_index
                )

            # Extract start_date / end_date
            if entities.start_date:
                draft.start_date = SlotValue(
                    value=entities.start_date,
                    confidence=parsed_result.confidence,
                    source=SlotSource.USER_EXPLICIT,
                    msg_index=msg_index
                )

        except Exception as e:
            logger.error(f"Error in IncrementalParser: {e}")

        return draft
