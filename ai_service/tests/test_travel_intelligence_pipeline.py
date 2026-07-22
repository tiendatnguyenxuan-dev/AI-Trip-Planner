import pytest
from app.shared.context.trip_context import TripContext
from app.shared.di import container

@pytest.mark.asyncio
async def test_full_travel_intelligence_pipeline():
    context = TripContext(text="Tôi muốn đi Đà Lạt 2 ngày 1 đêm budget 3 triệu", user_id="user_test_til")
    
    response = await container.trip_pipeline.execute(context)
    
    assert response is not None
    assert response.itinerary is not None
    assert len(response.itinerary.days) > 0
    assert context.travel_intelligence is not None
    assert context.travel_intelligence.destination.canonical_name == "Đà Lạt"
    assert context.travel_intelligence.route_matrix is not None
    assert context.travel_intelligence.budget_breakdown.total_estimated > 0
