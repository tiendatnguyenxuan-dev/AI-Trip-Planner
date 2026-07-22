import pytest
from app.domain.entities.travel_intelligence import (
    DestinationEntity, RouteSegment, RouteMatrix, TransitMode,
    WeatherReport, WeatherCondition, ItemizedCost, BudgetBreakdown,
    TemporalWindow, OptimizedActivity, EnrichedTravelContext
)

def test_travel_intelligence_entities():
    dest = DestinationEntity(
        destination_id="dest-001",
        canonical_name="Ho Chi Minh City",
        aliases=["Saigon", "TPHCM", "HCMC"],
        latitude=10.7769,
        longitude=106.7009
    )
    assert dest.canonical_name == "Ho Chi Minh City"
    assert "Saigon" in dest.aliases

    segment = RouteSegment(
        origin_place_id="p1",
        destination_place_id="p2",
        distance_meters=1500.0,
        duration_seconds=300.0,
        transit_mode=TransitMode.MOTORBIKE
    )
    matrix = RouteMatrix(matrix={"p1": {"p2": segment}})
    assert matrix.get_segment("p1", "p2").distance_meters == 1500.0

    weather = WeatherReport(
        date="2026-07-23",
        condition=WeatherCondition.CLEAR,
        temp_celsius_min=25.0,
        temp_celsius_max=32.0,
        precipitation_probability=10.0,
        is_suitable_for_outdoor=True
    )
    assert weather.is_suitable_for_outdoor is True

    item_cost = ItemizedCost(category="TRANSPORT", estimated_amount=50000.0)
    budget = BudgetBreakdown(total_estimated=500000.0, transport_cost=50000.0, items=[item_cost])
    assert budget.total_estimated == 500000.0

    enriched = EnrichedTravelContext(
        destination=dest,
        route_matrix=matrix,
        weather_forecast=[weather],
        budget_breakdown=budget
    )
    assert enriched.destination.canonical_name == "Ho Chi Minh City"
