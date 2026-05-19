import sys
import os

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.entity_extractor import entity_extractor

def test_cases():
    cases = [
        "tôi muốn đi sapa, xuất phát ở hà nội vào ngày mai, 2 ngày 1 đêm",
        "từ sài gòn đi vũng tàu",
        "đi phú quốc khởi hành từ hà nội",
        "xuất phát tại đà nẵng đi nha trang",
        "tôi ở lâm đồng muốn đi hồ chí minh",
        "đi hà giang xuất phát từ bắc giang",
        "đi bà rịa - vũng tàu xuất phát từ tp hồ chí minh"
    ]
    
    print("\n" + "="*50)
    print("--- TESTING IMPROVED ENTITY EXTRACTOR (OPTION 1) ---")
    print("="*50 + "\n")
    
    for text in cases:
        result = entity_extractor.extract(text)
        print(f"Input       : '{text}'")
        print(f"Origin      : {result['origin']}")
        print(f"Destination : {result['destination']}")
        print("-" * 40)

if __name__ == "__main__":
    test_cases()
