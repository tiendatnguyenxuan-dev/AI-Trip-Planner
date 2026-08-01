import logging
import urllib.request
import json
import re
from typing import Dict, Any, Optional
from app.models.discovery_schemas import DestinationInfo

logger = logging.getLogger(__name__)

# Pre-defined fast cache for popular Vietnam travel destinations
DESTINATION_DATABASE: Dict[str, Dict[str, Any]] = {
    "vung tau": {
        "id": "vn_vung_tau",
        "canonical_name": "Bà Rịa - Vũng Tàu",
        "province": "Bà Rịa - Vũng Tàu",
        "country": "Vietnam",
        "lat": 10.3460,
        "lng": 107.0843,
        "zoom": 13,
        "viewport": {"northeast_lat": 10.4200, "northeast_lng": 107.1500, "southwest_lat": 10.3000, "southwest_lng": 107.0300}
    },
    "da lat": {
        "id": "vn_da_lat",
        "canonical_name": "Đà Lạt",
        "province": "Lâm Đồng",
        "country": "Vietnam",
        "lat": 11.9404,
        "lng": 108.4583,
        "zoom": 13,
        "viewport": {"northeast_lat": 12.0000, "northeast_lng": 108.5200, "southwest_lat": 11.8800, "southwest_lng": 108.4000}
    },
    "da nang": {
        "id": "vn_da_nang",
        "canonical_name": "Đà Nẵng",
        "province": "Đà Nẵng",
        "country": "Vietnam",
        "lat": 16.0544,
        "lng": 108.2022,
        "zoom": 13,
        "viewport": {"northeast_lat": 16.1200, "northeast_lng": 108.2800, "southwest_lat": 15.9800, "southwest_lng": 108.1400}
    },
    "phu quoc": {
        "id": "vn_phu_quoc",
        "canonical_name": "Phú Quốc",
        "province": "Kiên Giang",
        "country": "Vietnam",
        "lat": 10.2899,
        "lng": 103.9840,
        "zoom": 12,
        "viewport": {"northeast_lat": 10.4500, "northeast_lng": 104.1000, "southwest_lat": 10.1000, "southwest_lng": 103.8500}
    },
    "nha trang": {
        "id": "vn_nha_trang",
        "canonical_name": "Nha Trang",
        "province": "Khánh Hòa",
        "country": "Vietnam",
        "lat": 12.2388,
        "lng": 109.1967,
        "zoom": 13,
        "viewport": {"northeast_lat": 12.3000, "northeast_lng": 109.2500, "southwest_lat": 12.1800, "southwest_lng": 109.1400}
    },
    "ha noi": {
        "id": "vn_ha_noi",
        "canonical_name": "Hà Nội",
        "province": "Hà Nội",
        "country": "Vietnam",
        "lat": 21.0285,
        "lng": 105.8542,
        "zoom": 13,
        "viewport": {"northeast_lat": 21.1000, "northeast_lng": 105.9200, "southwest_lat": 20.9500, "southwest_lng": 105.7800}
    },
    "ho chi minh": {
        "id": "vn_ho_chi_minh",
        "canonical_name": "Hồ Chí Minh",
        "province": "Hồ Chí Minh",
        "country": "Vietnam",
        "lat": 10.7769,
        "lng": 106.7009,
        "zoom": 13,
        "viewport": {"northeast_lat": 10.8500, "northeast_lng": 106.7800, "southwest_lat": 10.7000, "southwest_lng": 106.6200}
    },
    "phan thiet": {
        "id": "vn_phan_thiet",
        "canonical_name": "Phan Thiết",
        "province": "Bình Thuận",
        "country": "Vietnam",
        "lat": 10.9333,
        "lng": 108.1000,
        "zoom": 13,
        "viewport": {"northeast_lat": 10.9800, "northeast_lng": 108.1500, "southwest_lat": 10.8800, "southwest_lng": 108.0500}
    },
    "hoi an": {
        "id": "vn_hoi_an",
        "canonical_name": "Hội An",
        "province": "Quảng Nam",
        "country": "Vietnam",
        "lat": 15.8801,
        "lng": 108.3380,
        "zoom": 14,
        "viewport": {"northeast_lat": 15.9200, "northeast_lng": 108.3800, "southwest_lat": 15.8400, "southwest_lng": 108.3000}
    },
    "sapa": {
        "id": "vn_sapa",
        "canonical_name": "Sa Pa",
        "province": "Lào Cai",
        "country": "Vietnam",
        "lat": 22.3364,
        "lng": 103.8438,
        "zoom": 13,
        "viewport": {"northeast_lat": 22.3800, "northeast_lng": 103.9000, "southwest_lat": 22.2800, "southwest_lng": 103.7800}
    }
}

class DestinationResolver:
    """
    Resolves informal user query to normalized DestinationInfo metadata.
    Combines fast local lookup cache with dynamic OpenStreetMap Nominatim geocoding fallback.
    """

    def resolve(self, query: str) -> DestinationInfo:
        q_clean = query.strip()
        q_lower = q_clean.lower()
        
        # 1. Check Fast Local Cache
        for key, data in DESTINATION_DATABASE.items():
            if key in q_lower or q_lower in key:
                return DestinationInfo(
                    destination_id=data["id"],
                    canonical_name=data["canonical_name"],
                    province=data["province"],
                    country=data["country"],
                    lat=data["lat"],
                    lng=data["lng"],
                    viewport=data["viewport"],
                    default_zoom=data["zoom"]
                )

        # 2. Dynamic Online Geocoding via OpenStreetMap Nominatim
        try:
            encoded_q = urllib.parse.quote(q_clean)
            url = f"https://nominatim.openstreetmap.org/search?format=json&q={encoded_q}&limit=1"
            req = urllib.request.Request(url, headers={'User-Agent': 'AI-Trip-Planner/1.0'})
            with urllib.request.urlopen(req, timeout=3) as resp:
                results = json.loads(resp.read().decode('utf-8'))
                if results and len(results) > 0:
                    item = results[0]
                    lat = float(item['lat'])
                    lng = float(item['lon'])
                    display_name = item.get('display_name', q_clean).split(',')[0]
                    dest_id = re.sub(r'[^a-zA-Z0-9]', '_', q_lower)
                    
                    bbox = item.get('boundingbox', [lat - 0.05, lat + 0.05, lng - 0.05, lng + 0.05])
                    viewport = {
                        "northeast_lat": float(bbox[1]),
                        "northeast_lng": float(bbox[3]),
                        "southwest_lat": float(bbox[0]),
                        "southwest_lng": float(bbox[2])
                    }
                    
                    logger.info(f"Dynamically geocoded '{q_clean}' -> {display_name} ({lat}, {lng})")
                    return DestinationInfo(
                        destination_id=f"geo_{dest_id}",
                        canonical_name=display_name,
                        province=display_name,
                        country="Vietnam",
                        lat=lat,
                        lng=lng,
                        viewport=viewport,
                        default_zoom=13
                    )
        except Exception as e:
            logger.warn(f"Dynamic geocoding for '{query}' failed: {e}. Falling back to default.")

        # 3. Default fallback to Đà Lạt
        default_data = DESTINATION_DATABASE["da lat"]
        return DestinationInfo(
            destination_id=default_data["id"],
            canonical_name=q_clean.title() if q_clean else default_data["canonical_name"],
            province=default_data["province"],
            country=default_data["country"],
            lat=default_data["lat"],
            lng=default_data["lng"],
            viewport=default_data["viewport"],
            default_zoom=default_data["zoom"]
        )
