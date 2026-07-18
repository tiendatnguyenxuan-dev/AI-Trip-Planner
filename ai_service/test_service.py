import asyncio
import json
from app.pipelines.parse_pipeline import parse_pipeline
from app.pipelines.trip_pipeline import trip_pipeline
from app.shared.context.trip_context import TripContext

async def test_parse():
    test_cases = [
        # High confidence (should be regex | hybrid)
        "đi đà lạt 3 ngày 2 đêm budget 2tr cùng gia đình nghỉ dưỡng",
        # Medium confidence (missing some fields)
        "muốn tìm khách sạn ở phú quốc tuần tới đi với người yêu",
        # Low confidence (trigger LLM)
        "tôi không biết đi đâu, có 5 triệu",
        # Another Low confidence
        "lịch trình nào hay cho một người vào tháng sau?"
    ]
    
    print("\n" + "="*50)
    print("--- HYBRID AI QUERY PARSING TEST ---")
    print("="*50 + "\n")
    
    for text in test_cases:
        print(f"\n[INPUT] {text}")
        context = TripContext(text)
        result = await parse_pipeline.execute(context)
        
        print("\n[FINAL RESULT]")
        print(f"Intent    : {result.intent}")
        print(f"Confidence: {result.confidence}")
        print(f"Source    : {result.source}")
        print(f"Entities  : {json.dumps(result.entities.model_dump(exclude_none=True), ensure_ascii=False, indent=2)}")
        print("-" * 50)

async def test_trip_plan():
    test_cases = [
        "đi đà lạt 3 ngày 2 đêm budget 1tr khám phá",
        "lịch trình nha trang 2 ngày nghỉ dưỡng budget 4 triệu",
        "phú quốc 1 ngày"
    ]
    
    print("\n" + "="*50)
    print("--- TRIP PLANNING ENGINE TEST ---")
    print("="*50 + "\n")
    
    for text in test_cases:
        print(f"\n[INPUT] {text}")
        context = TripContext(text)
        result = await trip_pipeline.execute(context)
        
        print("\n[TRIP PLAN RESULT]")
        print(f"Intent    : {result.intent}")
        print(f"Entities  : {json.dumps(result.entities.model_dump(exclude_none=True), ensure_ascii=False, indent=2)}")
        print(f"Recommendations: {json.dumps(result.recommendations.model_dump(exclude_none=True), ensure_ascii=False, indent=2)}")
        print(f"Itinerary : {json.dumps(result.itinerary.model_dump(exclude_none=True), ensure_ascii=False, indent=2)}")
        print("-" * 50)


async def test_personalization():
    print("\n" + "="*50)
    print("--- PERSONALIZATION TEST ---")
    print("="*50 + "\n")
    
    user_id = "user_123"
    
    # First request: Provide details to build history
    req1 = "đi đà lạt 3 ngày budget 2tr chill"
    print(f"\n[REQUEST 1 (Build Profile)] {req1}")
    ctx1 = TripContext(req1, user_id=user_id)
    res1 = await trip_pipeline.execute(ctx1)
    print(f"Personalized: {res1.personalized}")
    print(f"Entities: {res1.entities.model_dump(exclude_none=True)}")
    
    # Second request: Missing vibe and budget, should auto-fill
    req2 = "nha trang 2 ngày"
    print(f"\n[REQUEST 2 (Missing info)] {req2}")
    ctx2 = TripContext(req2, user_id=user_id)
    res2 = await trip_pipeline.execute(ctx2)
    print(f"Personalized: {res2.personalized}")
    print(f"Entities: {res2.entities.model_dump(exclude_none=True)}")
    
    # Third request: Completely blank destination
    req3 = "muốn đi đâu đó 1 ngày thư giãn"
    print(f"\n[REQUEST 3 (Missing destination)] {req3}")
    ctx3 = TripContext(req3, user_id=user_id)
    res3 = await trip_pipeline.execute(ctx3)
    print(f"Personalized: {res3.personalized}")
    print(f"Entities: {res3.entities.model_dump(exclude_none=True)}")
    print("-" * 50)

if __name__ == "__main__":
    # asyncio.run(test_parse())
    # asyncio.run(test_trip_plan())
    asyncio.run(test_personalization())
