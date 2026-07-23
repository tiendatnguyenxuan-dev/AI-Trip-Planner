import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_modify_itinerary_endpoint():
    payload = {
        "user_prompt": "Thay thế nhà hàng hải sản Ngày 2 bằng quán ăn chay",
        "modification_scope": "REGENERATE_DAY_2",
        "existing_trip": {
            "destination": "Đà Nẵng",
            "duration_days": 3
        }
    }
    response = client.post("/ai/modify-itinerary", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert "partial_update" in data

def test_chat_stream_endpoint():
    payload = {"prompt": "Xin chào AI Travel Concierge"}
    response = client.post("/ai/chat-stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
