import logging
from typing import Optional
from app.domain.interfaces.destination_resolver_interface import IDestinationResolver
from app.domain.entities.travel_intelligence import DestinationEntity

logger = logging.getLogger(__name__)

# Static catalog of common Vietnam destinations and aliases
KNOWN_DESTINATIONS = [
    DestinationEntity(
        destination_id="dest-dl",
        canonical_name="Đà Lạt",
        aliases=["da lat", "dalat", "thanh pho ngan hoa"],
        latitude=11.9404,
        longitude=108.4583,
        province="Lâm Đồng"
    ),
    DestinationEntity(
        destination_id="dest-hcm",
        canonical_name="Hồ Chí Minh",
        aliases=["ho chi minh", "tphcm", "saigon", "sài gòn", "hcmc", "tp.hcm"],
        latitude=10.7769,
        longitude=106.7009,
        province="Thành phố Hồ Chí Minh"
    ),
    DestinationEntity(
        destination_id="dest-dn",
        canonical_name="Đà Nẵng",
        aliases=["da nang", "danang", "tp da nang"],
        latitude=16.0544,
        longitude=108.2022,
        province="Đà Nẵng"
    ),
    DestinationEntity(
        destination_id="dest-hn",
        canonical_name="Hà Nội",
        aliases=["ha noi", "hanoi", "ha noi city"],
        latitude=21.0285,
        longitude=105.8542,
        province="Hà Nội"
    ),
    DestinationEntity(
        destination_id="dest-pq",
        canonical_name="Phú Quốc",
        aliases=["phu quoc", "phuquoc", "dao phu quoc"],
        latitude=10.2899,
        longitude=103.9840,
        province="Kiên Giang"
    )
]

class StaticDestinationResolver(IDestinationResolver):
    """
    Static alias matching destination resolver for Vietnam travel spots.
    """
    async def resolve(self, raw_query: str) -> Optional[DestinationEntity]:
        if not raw_query:
            return None
        
        query_lower = raw_query.lower().strip()
        for dest in KNOWN_DESTINATIONS:
            if dest.canonical_name.lower() in query_lower:
                return dest
            for alias in dest.aliases:
                if alias in query_lower:
                    return dest
                    
        # Dynamic fallback for unmapped destination strings
        return DestinationEntity(
            destination_id=f"dest-custom-{hash(query_lower)}",
            canonical_name=raw_query.title(),
            aliases=[query_lower],
            latitude=10.7769, # fallback lat/lon
            longitude=106.7009
        )
