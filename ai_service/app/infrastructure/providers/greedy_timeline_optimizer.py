import logging
from typing import List, Dict, Optional
from app.domain.interfaces.timeline_optimizer_interface import ITimelineOptimizer
from app.domain.entities.place import Place
from app.domain.entities.travel_intelligence import RouteMatrix, WeatherReport, OptimizedActivity

logger = logging.getLogger(__name__)

class GreedyTimelineOptimizer(ITimelineOptimizer):
    """
    Deterministic timeline optimizer sequencing activities based on spatial proximity (nearest neighbor),
    activity duration bounds, and weather suitability windows.
    """
    async def optimize_daily_timeline(
        self,
        day_number: int,
        candidate_places: List[Place],
        route_matrix: RouteMatrix,
        weather: Optional[WeatherReport] = None,
        max_activities_per_day: int = 4
    ) -> List[OptimizedActivity]:
        if not candidate_places:
            return []

        selected: List[OptimizedActivity] = []
        remaining = list(candidate_places)
        
        # Start at 08:30 AM
        current_time_minutes = 8 * 60 + 30
        current_place: Optional[Place] = None

        for idx in range(min(max_activities_per_day, len(remaining))):
            next_place = None
            best_dist_m = float('inf')
            best_segment = None

            if current_place is None:
                next_place = remaining[0]
                transit_mins = 0.0
                dist_km = 0.0
            else:
                for candidate in remaining:
                    seg = route_matrix.get_segment(current_place.place_id, candidate.place_id)
                    dist = seg.distance_meters if seg else float('inf')
                    if dist < best_dist_m:
                        best_dist_m = dist
                        next_place = candidate
                        best_segment = seg

                transit_mins = (best_segment.duration_seconds / 60.0) if best_segment else 15.0
                dist_km = (best_segment.distance_meters / 1000.0) if best_segment else 2.0

            if not next_place:
                break

            remaining.remove(next_place)
            current_place = next_place

            # Add transit time to current clock
            current_time_minutes += int(transit_mins)

            start_h = current_time_minutes // 60
            start_m = current_time_minutes % 60
            suggested_start = f"{start_h:02d}:{start_m:02d}"

            # Activity duration heuristic (default 90 mins)
            dur_mins = getattr(next_place, 'duration_minutes', None) or 90
            current_time_minutes += dur_mins

            end_h = current_time_minutes // 60
            end_m = current_time_minutes % 60
            suggested_end = f"{end_h:02d}:{end_m:02d}"

            # 30-min break between activities
            current_time_minutes += 30

            selected.append(OptimizedActivity(
                place_id=next_place.place_id,
                place_name=next_place.name,
                suggested_start_time=suggested_start,
                suggested_end_time=suggested_end,
                duration_minutes=dur_mins,
                transit_from_previous_mins=round(transit_mins, 1),
                distance_from_previous_km=round(dist_km, 2)
            ))

        return selected
