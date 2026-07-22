import os
from app.infrastructure.repositories.in_memory_user_repository import InMemoryUserRepository
from app.infrastructure.repositories.file_history_repository import FileHistoryRepository
from app.infrastructure.repositories.place_repository import PlaceRepository

from app.infrastructure.providers.static_dataset_provider import StaticDatasetProvider
from app.infrastructure.providers.openstreetmap_provider import OpenStreetMapProvider
from app.infrastructure.providers.google_places_provider import GooglePlacesProvider

# Travel Intelligence Layer Providers
from app.infrastructure.providers.static_destination_resolver import StaticDestinationResolver
from app.infrastructure.providers.haversine_route_engine import HaversineRouteEngine
from app.infrastructure.providers.static_weather_engine import StaticWeatherEngine
from app.infrastructure.providers.standard_budget_engine import StandardBudgetEngine
from app.infrastructure.providers.greedy_timeline_optimizer import GreedyTimelineOptimizer
from app.infrastructure.providers.in_memory_knowledge_graph import InMemoryKnowledgeGraph
from app.infrastructure.providers.in_memory_telemetry import InMemoryTelemetryCollector

from app.infrastructure.gateways.ollama_gateway import OllamaGateway
from app.infrastructure.gateways.openai_gateway import OpenAIGateway

from app.services.user_service import UserService
from app.services.recommendation_service import RecommendationService
from app.services.history_service import HistoryService
from app.services.llm_service import LLMService
from app.services.itinerary_service import ItineraryService
from app.services.personalization_service import PersonalizationService
from app.services.entity_extractor import EntityExtractor
from app.services.intent_service import IntentService
from app.services.classifier_service import ClassifierService
from app.services.confidence_service import ConfidenceService
from app.services.recommendation_engine import RecommendationEngine
from app.services.ranking_engine import RankingEngine
from app.services.validation_service import ValidationService
from app.services.repair_service import RepairService
from app.services.travel_intelligence_service import TravelIntelligenceService

from app.pipelines.parse_pipeline import ParsePipeline
from app.application.nodes.fetch_user_node import FetchUserNode
from app.application.nodes.parse_node import ParseNode
from app.application.nodes.personalization_node import PersonalizationNode
from app.application.nodes.recommendation_node import RecommendationNode
from app.application.nodes.travel_intelligence_node import TravelIntelligenceNode
from app.application.nodes.planning_node import PlanningNode
from app.application.nodes.history_node import HistoryNode

class Container:
    """
    Dependency Injection Container managing lifecycle and wiring of core application classes.
    Strictly functions as the composition root, wiring dependencies explicitly through constructor injection.
    """
    def __init__(self):
        # 1. Infrastructure Repositories & Providers
        self.user_repository = InMemoryUserRepository()
        self.history_repository = FileHistoryRepository()
        
        # Configure Place Providers
        self.static_provider = StaticDatasetProvider()
        self.osm_provider = OpenStreetMapProvider()
        self.google_provider = GooglePlacesProvider()
        
        self.place_repository = PlaceRepository(providers=[
            self.static_provider,
            self.osm_provider,
            self.google_provider
        ])

        # Configure Travel Intelligence Layer Providers
        self.destination_resolver = StaticDestinationResolver()
        self.route_engine = HaversineRouteEngine()
        self.weather_engine = StaticWeatherEngine()
        self.budget_engine = StandardBudgetEngine()
        self.timeline_optimizer = GreedyTimelineOptimizer()
        self.knowledge_graph = InMemoryKnowledgeGraph()
        self.telemetry_collector = InMemoryTelemetryCollector()

        # 2. LLM Gateway selection
        provider = os.getenv("LLM_PROVIDER", "ollama").lower()
        if provider == "openai":
            self.llm_gateway = OpenAIGateway()
        else:
            self.llm_gateway = OllamaGateway()

        # 3. Services Layer
        self.user_service = UserService(repository=self.user_repository)
        self.history_service = HistoryService(repository=self.history_repository)
        self.recommendation_service = RecommendationService(repository=self.place_repository) # Compatibility bridge
        self.llm_service = LLMService(gateway=self.llm_gateway)
        self.itinerary_service = ItineraryService(
            recommendation_repository=self.place_repository,
            llm_service=self.llm_service
        )
        self.personalization_service = PersonalizationService()
        self.entity_extractor = EntityExtractor(recommendation_repository=self.place_repository)
        self.intent_service = IntentService()
        self.classifier_service = ClassifierService()
        self.confidence_service = ConfidenceService()
        
        # Recommendation & Validation engines
        self.ranking_engine = RankingEngine()
        self.recommendation_engine = RecommendationEngine(
            place_repository=self.place_repository,
            ranking_engine=self.ranking_engine
        )
        self.validation_service = ValidationService()
        self.repair_service = RepairService()

        # Travel Intelligence Orchestration Service
        self.travel_intelligence_service = TravelIntelligenceService(
            destination_resolver=self.destination_resolver,
            route_engine=self.route_engine,
            weather_engine=self.weather_engine,
            budget_engine=self.budget_engine,
            timeline_optimizer=self.timeline_optimizer,
            knowledge_graph=self.knowledge_graph,
            telemetry=self.telemetry_collector
        )

        # 4. Pipelines
        self.parse_pipeline = ParsePipeline(
            recommendation_repository=self.place_repository,
            entity_extractor=self.entity_extractor,
            intent_service=self.intent_service,
            classifier_service=self.classifier_service,
            confidence_service=self.confidence_service,
            llm_service=self.llm_service
        )

        # 5. Application Nodes (Explicit constructor injection)
        self.fetch_user_node = FetchUserNode(user_service=self.user_service)
        self.parse_node = ParseNode(parse_pipeline=self.parse_pipeline)
        self.personalization_node = PersonalizationNode(personalization_service=self.personalization_service)
        self.recommendation_node = RecommendationNode(recommendation_engine=self.recommendation_engine)
        self.travel_intelligence_node = TravelIntelligenceNode(intelligence_service=self.travel_intelligence_service)
        self.planning_node = PlanningNode(
            itinerary_service=self.itinerary_service,
            timeline_optimizer=self.timeline_optimizer
        )
        self.history_node = HistoryNode(history_service=self.history_service, user_service=self.user_service)

        # 6. Orchestration Pipeline
        from app.pipelines.trip_pipeline import TripPipeline
        self.trip_pipeline = TripPipeline(
            nodes=[
                self.fetch_user_node,
                self.parse_node,
                self.personalization_node,
                self.recommendation_node,
                self.travel_intelligence_node,
                self.planning_node,
                self.history_node
            ],
            validation_service=self.validation_service,
            repair_service=self.repair_service
        )

container = Container()
