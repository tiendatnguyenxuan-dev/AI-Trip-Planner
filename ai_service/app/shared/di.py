import os
from app.infrastructure.repositories.in_memory_user_repository import InMemoryUserRepository
from app.infrastructure.repositories.file_history_repository import FileHistoryRepository
from app.infrastructure.repositories.json_recommendation_repository import JSONRecommendationRepository
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

from app.pipelines.parse_pipeline import ParsePipeline
from app.application.nodes.fetch_user_node import FetchUserNode
from app.application.nodes.parse_node import ParseNode
from app.application.nodes.personalization_node import PersonalizationNode
from app.application.nodes.recommendation_node import RecommendationNode
from app.application.nodes.planning_node import PlanningNode
from app.application.nodes.history_node import HistoryNode

class Container:
    """
    Dependency Injection Container managing lifecycle and wiring of core application classes.
    Strictly functions as the composition root, wiring dependencies explicitly through constructor injection.
    """
    def __init__(self):
        # 1. Infrastructure Repositories
        self.user_repository = InMemoryUserRepository()
        self.history_repository = FileHistoryRepository()
        self.recommendation_repository = JSONRecommendationRepository()

        # 2. LLM Gateway selection
        provider = os.getenv("LLM_PROVIDER", "ollama").lower()
        if provider == "openai":
            self.llm_gateway = OpenAIGateway()
        else:
            self.llm_gateway = OllamaGateway()

        # 3. Services Layer
        self.user_service = UserService(repository=self.user_repository)
        self.history_service = HistoryService(repository=self.history_repository)
        self.recommendation_service = RecommendationService(repository=self.recommendation_repository)
        self.llm_service = LLMService(gateway=self.llm_gateway)
        self.itinerary_service = ItineraryService(
            recommendation_repository=self.recommendation_repository,
            llm_service=self.llm_service
        )
        self.personalization_service = PersonalizationService()
        self.entity_extractor = EntityExtractor(recommendation_repository=self.recommendation_repository)
        self.intent_service = IntentService()
        self.classifier_service = ClassifierService()
        self.confidence_service = ConfidenceService()

        # 4. Pipelines
        self.parse_pipeline = ParsePipeline(
            recommendation_repository=self.recommendation_repository,
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
        self.recommendation_node = RecommendationNode(recommendation_service=self.recommendation_service)
        self.planning_node = PlanningNode(itinerary_service=self.itinerary_service)
        self.history_node = HistoryNode(history_service=self.history_service, user_service=self.user_service)

        # 6. Orchestration Pipeline
        from app.pipelines.trip_pipeline import TripPipeline
        self.trip_pipeline = TripPipeline(nodes=[
            self.fetch_user_node,
            self.parse_node,
            self.personalization_node,
            self.recommendation_node,
            self.planning_node,
            self.history_node
        ])

container = Container()
