from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.schemas import ParseRequest, ParseResponse, TripPlanResponse
from app.pipelines.parse_pipeline import parse_pipeline
from app.pipelines.trip_pipeline import trip_pipeline

router = APIRouter()

from app.shared.context.trip_context import TripContext

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
        # In production, log the error properly
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
    Raw chat completions endpoint that proxies to the underlying LLM service.
    """
    import logging
    logger = logging.getLogger(__name__)
    try:
        from app.services.llm_service import llm_service
        messages = [{"role": "user", "content": request.prompt}]
        logger.info(f"📨 /chat called. Prompt length: {len(request.prompt)} chars")
        response = await llm_service.call_llm_raw(messages)
        logger.info(f"📩 LLM response model={response['model']}, content length={len(response['content'])}")
        logger.info(f"📩 LLM content preview: {response['content'][:500]}")
        return ChatResponse(
            content=response["content"],
            model=response["model"],
            prompt_tokens=response["prompt_tokens"],
            completion_tokens=response["completion_tokens"]
        )
    except Exception as e:
        logger.error(f"❌ /chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
