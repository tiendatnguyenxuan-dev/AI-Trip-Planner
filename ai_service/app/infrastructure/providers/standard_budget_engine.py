import logging
from typing import List, Optional
from app.domain.interfaces.budget_engine_interface import IBudgetEngine
from app.domain.entities.place import Place, Hotel, Restaurant
from app.domain.entities.travel_intelligence import BudgetBreakdown, ItemizedCost, RouteMatrix

logger = logging.getLogger(__name__)

class StandardBudgetEngine(IBudgetEngine):
    """
    Algorithmic budget breakdown estimator for accommodation, dining, transport, and attractions.
    """
    # Average pricing defaults in VND
    DAILY_MEAL_COST_PER_PERSON = 300_000.0  # 3 meals
    HOTEL_NIGHTLY_DEFAULT = 600_000.0
    TRANSPORT_BASE_PER_DAY = 150_000.0
    ATTRACTION_TICKET_DEFAULT = 100_000.0

    async def estimate_budget(
        self,
        total_budget_limit: Optional[float],
        duration_days: int,
        places: List[Place],
        hotels: List[Hotel],
        restaurants: List[Restaurant],
        route_matrix: Optional[RouteMatrix] = None
    ) -> BudgetBreakdown:
        items = []

        # 1. Accommodation
        nightly = self.HOTEL_NIGHTLY_DEFAULT
        if hotels and hotels[0].price_level:
            if hotels[0].price_level == "BUDGET":
                nightly = 350_000.0
            elif hotels[0].price_level == "EXPENSIVE":
                nightly = 1_500_000.0
            elif hotels[0].price_level == "ULTRA_LUXURY":
                nightly = 3_500_000.0

        hotel_total = nightly * max(1, duration_days - 1)
        items.append(ItemizedCost(
            category="ACCOMMODATION",
            estimated_amount=hotel_total,
            notes=f"Estimated {max(1, duration_days - 1)} nights"
        ))

        # 2. Food & Dining
        food_total = self.DAILY_MEAL_COST_PER_PERSON * duration_days
        items.append(ItemizedCost(
            category="FOOD",
            estimated_amount=food_total,
            notes=f"Estimated food & dining for {duration_days} days"
        ))

        # 3. Transport
        transport_total = self.TRANSPORT_BASE_PER_DAY * duration_days
        if route_matrix:
            # Add dynamic distance transport factor
            total_dist_km = 0.0
            for orig_id, dest_map in route_matrix.matrix.items():
                for dest_id, seg in dest_map.items():
                    total_dist_km += seg.distance_meters / 1000.0
            transport_total += total_dist_km * 5_000.0 # 5k VND/km transit estimate

        items.append(ItemizedCost(
            category="TRANSPORT",
            estimated_amount=transport_total,
            notes=f"Transit and local movement cost"
        ))

        # 4. Attractions
        attractions_total = len(places) * self.ATTRACTION_TICKET_DEFAULT
        items.append(ItemizedCost(
            category="ATTRACTION",
            estimated_amount=attractions_total,
            notes=f"Tickets for {len(places)} activities"
        ))

        sum_total = hotel_total + food_total + transport_total + attractions_total

        return BudgetBreakdown(
            total_estimated=sum_total,
            currency="VND",
            accommodation_cost=hotel_total,
            food_cost=food_total,
            transport_cost=transport_total,
            attractions_cost=attractions_total,
            items=items
        )
