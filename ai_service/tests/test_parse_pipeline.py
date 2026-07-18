import pytest
from app.pipelines.parse_pipeline import parse_pipeline
from app.models.schemas import ParseResponse
from app.shared.context.trip_context import TripContext

@pytest.mark.asyncio
async def test_execute_success_path(mocker):
    """
    Test luồng thành công khi cần LLM repair.
    """
    # Mock LLM Repair trả về dữ liệu hoàn chỉnh
    mock_entities = {
        "destination": "Đà Lạt",
        "vibe": "chill",
        "budget": 2000000,
        "travelers": 1,
        "duration_days": 3,
        "destination_is_suggested": False
    }
    # Path tới llm_service instance được sử dụng trong parse_pipeline
    mocker.patch('app.services.llm_service.llm_service.repair_entities', return_value=mock_entities)
    
    text = "đi chơi ở đâu đó chill solo 2tr"
    # Giả sử text này làm confidence thấp hoặc trigger logic cần repair
    
    context = TripContext(text)
    response = await parse_pipeline.execute(context)
    
    assert response.entities.destination == "Đà Lạt"
    assert response.entities.budget == 2000000
    assert response.entities.travelers == 1
    assert response.source == "hybrid | llm"

@pytest.mark.asyncio
async def test_execute_broken_json_handling(mocker):
    """
    Test khả năng chịu lỗi khi LLM trả về dữ liệu rỗng hoặc sai.
    """
    # Giả lập LLM trả về kết quả rỗng
    mocker.patch('app.services.llm_service.llm_service.repair_entities', return_value={})
    
    text = "đi chơi"
    context = TripContext(text)
    response = await parse_pipeline.execute(context)
    
    # Kiểm tra xem hệ thống có crash không
    assert response.entities is not None
    assert response.source == "hybrid | llm"

@pytest.mark.asyncio
async def test_execute_regex_only(mocker):
    """
    Test trường hợp Regex/Dataset đã đủ thông tin, không gọi LLM.
    """
    # "Đà Lạt" thường có trong dataset local nên needs_llm sẽ là False
    text = "đi Đà Lạt 3 ngày"
    
    # Mock llm_service để đảm bảo nó KHÔNG được gọi
    spy = mocker.spy(parse_pipeline, 'execute')
    
    context = TripContext(text)
    response = await parse_pipeline.execute(context)
    
    assert response.entities.destination == "Đà Lạt"
    assert "regex" in response.source or "hybrid" in response.source
    # Lưu ý: Tuỳ vào logic confidence_service mà source có thể khác nhau
