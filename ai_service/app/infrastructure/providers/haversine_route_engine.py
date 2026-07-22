import math
import logging
from typing import List, Optional
from app.domain.interfaces.route_engine_interface import IRouteEngine
from app.domain.entities.place import Place
from app.domain.entities.travel_intelligence import RouteSegment, RouteMatrix, TransitMode

logger = logging.getLogger(__name__)

class HaversineRouteEngine(IRouteEngine):
    """
    Route engine provider using Haversine formula for distance and average velocity heuristics for duration.
    Serves as a reliable, zero-dependency baseline provider.
    """
    # Speed heuristics in km/h
    SPEED_MAP = {
        TransitMode.WALKING: 4.5,
        TransitMode.MOTORBIKE: 30.0,
        TransitMode.CAR: 25.0, # urban average
        TransitMode.PUBLIC_TRANSIT: 20.0
    }

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    async def get_route(self, origin: Place, destination: Place, mode: TransitMode = TransitMode.CAR) -> RouteSegment:
        if not origin.coordinates or not destination.coordinates:
            # Fallback for missing coordinates
            return RouteSegment(
                origin_place_id=origin.place_id,
                destination_place_id=destination.place_id,
                distance_meters=0.0,
                duration_seconds=0.0,
                transit_mode=mode
            )

        dist_m = self._haversine_distance(
            origin.coordinates.latitude, origin.coordinates.longitude,
            destination.coordinates.latitude, destination.coordinates.longitude
        )
        
        speed_kmh = self.SPEED_MAP.get(mode, 25.0)
        speed_ms = (speed_kmh * 1000.0) / 3600.0
        duration_sec = dist_m / speed_ms if speed_ms > 0 else 0.0

        return RouteSegment(
            origin_place_id=origin.place_id,
            destination_place_id=destination.place_id,
            distance_meters=round(dist_m, 2),
            duration_seconds=round(duration_sec, 2),
            transit_mode=mode
        )

    async def compute_matrix(self, places: List[Place], mode: TransitMode = TransitMode.CAR) -> RouteMatrix:
        matrix_dict = {}
        for origin in places:
            matrix_dict[origin.place_id] = {}
            for dest in places:
                if origin.place_id == dest.place_id:
                    matrix_dict[origin.place_id][dest.place_id] = RouteSegment(
                        origin_place_id=origin.place_id,
                        destination_place_id=dest.place_id,
                        distance_meters=0.0,
                        duration_seconds=0.0,
                        transit_mode=mode
                    )
                else:
                    segment = await self.get_route(origin, dest, mode)
                    matrix_dict[origin.place_id][dest.place_id] = segment
        return RouteMatrix(matrix=matrix_dict)
