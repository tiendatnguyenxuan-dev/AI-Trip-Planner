import asyncio
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.models.schemas import ParseRequest, ParseResponse, TripPlanResponse, ModifyItineraryRequest, ModifyItineraryResponse
from app.models.conversational_schemas import ConversationalPlanRequest, ConversationalPlanResponse
from app.models.discovery_schemas import DiscoverRequest, DiscoverResponse
from app.services.conversational.conversation_manager import conversation_manager
from app.services.discovery.discovery_service import discovery_service
from app.pipelines.parse_pipeline import parse_pipeline
from app.pipelines.trip_pipeline import trip_pipeline
from app.shared.context.trip_context import TripContext
from app.application.nodes.modification_planning_node import ModificationPlanningNode
from app.shared.di import container

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/discover-destination", response_model=DiscoverResponse)
async def discover_destination(request: DiscoverRequest):
    """
    Phase 6 Destination Discovery Experience Endpoint.
    Resolves destination coordinates, map markers, media, weather, and POIs.
    """
    try:
        discovery_ctx = discovery_service.discover(request.query)
        return DiscoverResponse(discovery_context=discovery_ctx)
    except Exception as e:
        logger.error(f"Error in /discover-destination: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/conversational-plan", response_model=ConversationalPlanResponse)
async def conversational_plan(request: ConversationalPlanRequest):
    """
    Phase 5 Stateful Conversational Travel Planning Endpoint.
    Gradually collects slot values across turns until required slots are completed.
    """
    try:
        return await conversation_manager.process_message(request)
    except Exception as e:
        logger.error(f"Error in /conversational-plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-query", response_model=ParseResponse)
async def parse_query(request: ParseRequest):
    """
    Parse a natural language travel query into structured data.
    """
    try:
        context = TripContext(request.text, request.user_id)
        result = await parse_pipeline.execute(context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plan-trip", response_model=TripPlanResponse)
async def plan_trip(request: ParseRequest):
    """
    Parse a query and generate a full trip plan (recommendations and itinerary).
    """
    try:
        context = TripContext(request.text, request.user_id)
        result = await trip_pipeline.execute(context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/modify-itinerary", response_model=ModifyItineraryResponse)
async def modify_itinerary(request: ModifyItineraryRequest):
    """
    Contextual partial itinerary modification reusing TripPipeline nodes.
    """
    try:
        context = TripContext(request.user_prompt, None)
        context.metadata["user_prompt"] = request.user_prompt
        context.metadata["modification_scope"] = request.modification_scope
        context.metadata["existing_trip"] = request.existing_trip or {}

        # 1. Run standard Parse, Recommendation, and Travel Intelligence pipeline nodes
        await container.fetch_user_node.execute(context)
        await container.parse_node.execute(context)
        await container.personalization_node.execute(context)
        await container.recommendation_node.execute(context)
        await container.travel_intelligence_node.execute(context)

        # 2. Execute ModificationPlanningNode for targeted partial generation
        mod_node = ModificationPlanningNode(timeline_optimizer=container.timeline_optimizer)
        await mod_node.execute(context)

        partial_update = context.metadata.get("partial_update", {})
        summary = context.metadata.get("modification_summary", f"Đã cập nhật: {request.user_prompt}")

        return ModifyItineraryResponse(
            content=summary,
            partial_update=partial_update,
            modified_components=list(partial_update.keys())
        )
    except Exception as e:
        logger.error(f"Error in modify-itinerary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    content: str
    model: str
    prompt_tokens: int
    completion_tokens: int

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Raw chat completions endpoint.
    """
    try:
        from app.services.llm_service import llm_service
        messages = [{"role": "user", "content": request.prompt}]
        response = await llm_service.call_llm_raw(messages)
        return ChatResponse(
            content=response["content"],
            model=response["model"],
            prompt_tokens=response["prompt_tokens"],
            completion_tokens=response["completion_tokens"]
        )
    except Exception as e:
        logger.error(f"❌ /chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat-stream")
async def chat_stream(request: ChatRequest):
    """
    SSE Real-time token streaming endpoint.
    """
    async def event_generator():
        prompt_text = request.prompt
        tokens = prompt_text.split()
        yield "data: Đã nhận được yêu cầu xử lý...\n\n"
        await asyncio.sleep(0.1)

        for i, token in enumerate(tokens):
            yield f"data: {token} \n\n"
            await asyncio.sleep(0.05)

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
