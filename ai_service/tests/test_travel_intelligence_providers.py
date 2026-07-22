import pytest
from app.infrastructure.providers.haversine_route_engine import HaversineRouteEngine
from app.infrastructure.providers.static_destination_resolver import StaticDestinationResolver
from app.infrastructure.providers.static_weather_engine import StaticWeatherEngine
from app.infrastructure.providers.standard_budget_engine import StandardBudgetEngine
from app.infrastructure.providers.in_memory_telemetry import InMemoryTelemetryCollector
from app.infrastructure.cache.in_memory_cache import InMemoryCache
from app.domain.entities.place import Place, Coordinates
from app.domain.entities.travel_intelligence import TransitMode

@pytest.mark.asyncio
async def test_haversine_route_engine():
    engine = HaversineRouteEngine()
    p1 = Place(place_id="p1", provider="static", external_id="1", name="Ben Thanh", coordinates=Coordinates(latitude=10.7721, longitude=106.6983), type="attraction")
    p2 = Place(place_id="p2", provider="static", external_id="2", name="Bitexco", coordinates=Coordinates(latitude=10.7716, longitude=106.7044), type="attraction")

    route = await engine.get_route(p1, p2, TransitMode.WALKING)
    assert route.distance_meters > 0
    assert route.duration_seconds > 0

    matrix = await engine.compute_matrix([p1, p2], TransitMode.MOTORBIKE)
    assert matrix.get_segment("p1", "p2") is not None

@pytest.mark.asyncio
async def test_static_destination_resolver():
    resolver = StaticDestinationResolver()
    dest1 = await resolver.resolve("Tôi muốn đi Saigon chơi")
    assert dest1 is not None
    assert dest1.canonical_name == "Hồ Chí Minh"

    dest2 = await resolver.resolve("Đà Lạt 3 ngày")
    assert dest2 is not None
    assert dest2.canonical_name == "Đà Lạt"

@pytest.mark.asyncio
async def test_standard_budget_engine():
    budget_engine = StandardBudgetEngine()
    p1 = Place(place_id="p1", provider="static", external_id="1", name="Museum", type="attraction")
    breakdown = await budget_engine.estimate_budget(
        total_budget_limit=5000000.0,
        duration_days=3,
        places=[p1],
        hotels=[],
        restaurants=[]
    )
    assert breakdown.total_estimated > 0
    assert len(breakdown.items) == 4

def test_in_memory_cache():
    cache = InMemoryCache()
    cache.set("key1", "val1", ttl_seconds=10)
    assert cache.get("key1") == "val1"
    assert cache.get("non_existent") is None
