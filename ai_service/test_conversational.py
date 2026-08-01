import sys
import io
import asyncio
import logging

from app.models.conversational_schemas import ConversationalPlanRequest
from app.services.conversational.conversation_manager import conversation_manager

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
logging.basicConfig(level=logging.INFO)

async def run_conversational_test():
    print("=== TESTING PHASE 5 CONVERSATIONAL TRIP PLANNING ===")
    
    # Turn 1: User provides only destination
    req1 = ConversationalPlanRequest(message="Tôi muốn đi du lịch Đà Lạt")
    res1 = await conversation_manager.process_message(req1)
    
    print(f"Turn 1 State: {res1.state.value}")
    print(f"Turn 1 Progress: {res1.progress * 100}%")
    print(f"Turn 1 AI Response: {res1.message}")
    print(f"Turn 1 Next Missing Slot: {res1.next_missing_slot}")
    print("-" * 50)

    # Turn 2: User provides duration
    req2 = ConversationalPlanRequest(session_id=res1.session_id, message="Đi 3 ngày 2 đêm nhé")
    res2 = await conversation_manager.process_message(req2)
    
    print(f"Turn 2 State: {res2.state.value}")
    print(f"Turn 2 Progress: {res2.progress * 100}%")
    print(f"Turn 2 AI Response: {res2.message}")
    print(f"Turn 2 Next Missing Slot: {res2.next_missing_slot}")
    print("-" * 50)

    # Turn 3: User provides budget
    req3 = ConversationalPlanRequest(session_id=res1.session_id, message="Ngân sách khoảng 5 triệu")
    res3 = await conversation_manager.process_message(req3)
    
    print(f"Turn 3 State: {res3.state.value}")
    print(f"Turn 3 Progress: {res3.progress * 100}%")
    print(f"Turn 3 AI Response: {res3.message}")
    print(f"Turn 3 Next Missing Slot: {res3.next_missing_slot}")
    print("-" * 50)

    # Turn 4: User provides group type -> Should trigger Planning
    req4 = ConversationalPlanRequest(session_id=res1.session_id, message="Tôi đi với gia đình")
    res4 = await conversation_manager.process_message(req4)
    
    print(f"Turn 4 Final State: {res4.state.value}")
    print(f"Turn 4 Final Progress: {res4.progress * 100}%")
    print(f"Turn 4 AI Response: {res4.message}")
    print(f"Itinerary Generated: {res4.itinerary is not None}")
    print("=== TEST COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_conversational_test())
