import re
from typing import Dict, Any, Optional
from app.services.data_service import data_service

class EntityExtractor:
    def __init__(self):
        # Build lookup mapping: lowercase name/alias -> standard casing from dataset
        self.dest_lookup = {}
        
        # Load destinations dynamically from JSON keys (loaded via data_service)
        try:
            keys = list(data_service.destinations.keys())
            for k in keys:
                if k:
                    self.dest_lookup[k.lower()] = k
        except Exception as e:
            # Fallback list if dataset is not available
            fallback = ["Đà Lạt", "Phú Quốc", "Nha Trang", "Hà Nội", "Sài Gòn", "Đà Nẵng", "Hội An", "Sapa"]
            for f in fallback:
                self.dest_lookup[f.lower()] = f
                
        # Common colloquial Vietnamese names / aliases and their formal counterparts
        self.aliases = {
            "sài gòn": "TP Hồ Chí Minh",
            "hồ chí minh": "TP Hồ Chí Minh",
            "tphcm": "TP Hồ Chí Minh",
            "hcm": "TP Hồ Chí Minh",
            "vũng tàu": "Bà Rịa - Vũng Tàu",
            "huế": "Thừa Thiên Huế",
            "hạ long": "Quảng Ninh",
            "hội an": "Quảng Nam"
        }
        for alias, formal in self.aliases.items():
            self.dest_lookup[alias] = formal

        # Sort keys by length descending to prevent matching substrings (e.g. "bà rịa - vũng tàu" before "vũng tàu")
        self.destinations = sorted(list(self.dest_lookup.keys()), key=len, reverse=True)
            
        self.vibes = ["chill", "khám phá", "nghỉ dưỡng", "sang chảnh", "phượt"]
        self.times = ["cuối tuần", "tháng sau", "tháng trước", "tuần tới", "ngày mai", "ngày mốt", "ngày kia", "ngày kìa"]

    def normalize_text(self, text: str) -> str:
        """Normalize Vietnamese text for better matching."""
        text = text.lower().strip()
        text = re.sub(r'\s+', ' ', text)
        return text

    def extract_budget(self, text: str) -> Optional[int]:
        """Extract budget from text (e.g., 2tr, 2 triệu, 2000000)."""
        # Handle "tr" or "triệu"
        million_match = re.search(r'(\d+)\s*(tr|triệu)', text)
        if million_match:
            return int(million_match.group(1)) * 1_000_000
        
        # Handle raw numbers (at least 5 digits to avoid confusion with days)
        raw_match = re.search(r'(\d{5,})', text)
        if raw_match:
            return int(raw_match.group(1))
            
        return None

    def extract_duration(self, text: str) -> Optional[int]:
        """Extract duration in days (e.g., 3 ngày, 3 ngày 2 đêm)."""
        # Handle "X ngày Y đêm" or "X ngày"
        duration_match = re.search(r'(\d+)\s*ngày', text)
        if duration_match:
            return int(duration_match.group(1))
        
        # Fallback to "X đêm" if days not mentioned (duration = nights + 1)
        night_match = re.search(r'(\d+)\s*đêm', text)
        if night_match:
            return int(night_match.group(1)) + 1
            
        return None

    def extract_origin(self, text: str) -> Optional[str]:
        """Extract origin (starting point) from text."""
        # Improved patterns supporting: "ở", "tại", "từ", "khởi hành từ", "xuất phát từ", "xuất phát ở", "xuất phát tại", "đi từ"
        match = re.search(
            r'(?:xuất phát ở|xuất phát tại|xuất phát từ|khởi hành từ|đi từ|từ|ở|tại)\s+([a-zà-ỹ\s]+)', 
            text
        )
        if match:
             # Avoid capturing the entire rest of string if it contains separators or action verbs
             location = re.split(r'\s+(?:đi|đến|tới|vào|ngày|tuần|tháng|muốn|cần|thích|sẽ)\s+', match.group(1))[0].strip()
             return location.title()
        return None

    def extract(self, text: str) -> Dict[str, Any]:
        normalized = self.normalize_text(text)
        
        origin = self.extract_origin(normalized)
        
        entities = {
            "destination": None,
            "origin": origin,
            "duration_days": self.extract_duration(normalized),
            "budget": self.extract_budget(normalized),
            "vibe": None,
            "time": None
        }

        # Filter out matched origin phrase from the text before searching for the destination
        dest_search_text = normalized
        if origin:
            escaped_origin = re.escape(origin.lower())
            origin_phrase_pattern = r'(?:xuất phát ở|xuất phát tại|xuất phát từ|khởi hành từ|đi từ|từ|ở|tại)\s+' + escaped_origin
            dest_search_text = re.sub(origin_phrase_pattern, '', normalized, flags=re.IGNORECASE)

        # Match keyword lists
        for d in self.destinations:
            if d in dest_search_text:
                entities["destination"] = self.dest_lookup[d]
                break
        
        for v in self.vibes:
            if v in normalized:
                entities["vibe"] = v
                break

        for t in self.times:
            if t in normalized:
                entities["time"] = t
                break

        return entities

entity_extractor = EntityExtractor()
