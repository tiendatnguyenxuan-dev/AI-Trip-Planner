import time
import logging
from app.domain.interfaces.destination_resolver_interface import IDestinationResolver
from app.domain.interfaces.route_engine_interface import IRouteEngine
from app.domain.interfaces.weather_engine_interface import IWeatherEngine
from app.domain.interfaces.budget_engine_interface import IBudgetEngine
from app.domain.interfaces.timeline_optimizer_interface import ITimelineOptimizer
from app.domain.interfaces.knowledge_graph_interface import IKnowledgeGraph
from app.domain.interfaces.telemetry_interface import ITelemetryCollector

from app.domain.entities.travel_intelligence import EnrichedTravelContext, TransitMode

logger = logging.getLogger(__name__)

class TravelIntelligenceService:
    """
    Orchestration service for the Travel Intelligence Layer (TIL).
    Aggregates environmental context (destination resolution, routing distance matrix,
    weather forecasts, budget itemization, timeline optimization, and knowledge graph clusters).
    """
    def __init__(
        self,
        destination_resolver: IDestinationResolver,
        route_engine: IRouteEngine,
        weather_engine: IWeatherEngine,
        budget_engine: IBudgetEngine,
        timeline_optimizer: ITimelineOptimizer,
        knowledge_graph: IKnowledgeGraph,
        telemetry: ITelemetryCollector
    ):
        self.destination_resolver = destination_resolver
        self.route_engine = route_engine
        self.weather_engine = weather_engine
        self.budget_engine = budget_engine
        self.timeline_optimizer = timeline_optimizer
        self.knowledge_graph = knowledge_graph
        self.telemetry = telemetry

    async def enrich_context(
        self,
        query_text: str,
        places: list,
        hotels: list,
        restaurants: list,
        duration_days: int = 1,
        budget_limit: float = None
    ) -> EnrichedTravelContext:
        start_t = time.time()
        logger.info("⚡ Executing Travel Intelligence Layer Enrichment...")

        # 1. Destination Resolution
        t0 = time.time()
        destination = await self.destination_resolver.resolve(query_text)
        self.telemetry.record_latency("destination_resolver", (time.time() - t0) * 1000)

        # 2. Routing Matrix
        t0 = time.time()
        route_matrix = await self.route_engine.compute_matrix(places, mode=TransitMode.MOTORBIKE)
        self.telemetry.record_latency("route_engine", (time.time() - t0) * 1000)

        # 3. Weather Forecast
        t0 = time.time()
        weather_forecast = await self.weather_engine.get_forecast(destination, days=duration_days)
        self.telemetry.record_latency("weather_engine", (time.time() - t0) * 1000)

        # 4. Budget Breakdown Estimation
        t0 = time.time()
        budget_breakdown = await self.budget_engine.estimate_budget(
            total_budget_limit=budget_limit,
            duration_days=duration_days,
            places=places,
            hotels=hotels,
            restaurants=restaurants,
            route_matrix=route_matrix
        )
        self.telemetry.record_latency("budget_engine", (time.time() - t0) * 1000)

        # 5. Place Relationships
        t0 = time.time()
        clusters = await self.knowledge_graph.get_clusters(destination.destination_id)
        self.telemetry.record_latency("knowledge_graph", (time.time() - t0) * 1000)

        total_ms = (time.time() - start_t) * 1000
        self.telemetry.record_latency("travel_intelligence_layer_total", total_ms)
        logger.info(f"⚡ Travel Intelligence Layer completed in {total_ms:.2f}ms")

        return EnrichedTravelContext(
            destination=destination,
            route_matrix=route_matrix,
            weather_forecast=weather_forecast,
            budget_breakdown=budget_breakdown,
            place_relationships=clusters
        )
