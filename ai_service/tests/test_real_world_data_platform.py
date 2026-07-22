import pytest
from app.infrastructure.providers.place_merge_engine import PlaceMergeEngine
from app.infrastructure.providers.wikipedia_provider import WikipediaProvider
from app.infrastructure.providers.provider_aggregator import ProviderAggregator
from app.infrastructure.providers.google_places_provider import GooglePlacesProvider
from app.infrastructure.providers.static_dataset_provider import StaticDatasetProvider
from app.domain.entities.place import Place, Coordinates, Metadata, Hotel

def test_place_merge_engine_deduplication():
    engine = PlaceMergeEngine()
    
    p1 = Place(
        place_id="google_1", provider="google", external_id="1",
        name="Chợ Bến Thành",
        coordinates=Coordinates(latitude=10.7721, longitude=106.6983),
        metadata=Metadata(rating=4.8, review_count=2000),
        type="attraction"
    )
    p2 = Place(
        place_id="osm_1", provider="openstreetmap", external_id="2",
        name="Ben Thanh Market",
        coordinates=Coordinates(latitude=10.7722, longitude=106.6984),
        metadata=Metadata(editorial_summary="Chợ trung tâm TP.HCM"),
        type="attraction"
    )

    assert engine.are_same_place(p1, p2) is True

    merged_list = engine.merge_place_list([p1, p2])
    assert len(merged_list) == 1
    merged = merged_list[0]
    assert merged.metadata.rating == 4.8
    assert "google" in merged.metadata.provenance.merged_providers
    assert "openstreetmap" in merged.metadata.provenance.merged_providers

def test_provider_aggregator():
    google_p = GooglePlacesProvider()
    wiki_p = WikipediaProvider()
    static_p = StaticDatasetProvider()
    
    aggregator = ProviderAggregator(providers=[google_p, wiki_p, static_p])
    
    places = aggregator.search_places("Bảo tàng", "Đà Lạt")
    assert len(places) > 0
    hotels = aggregator.search_hotels("Đà Lạt")
    assert len(hotels) > 0
