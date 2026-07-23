# ✈️ FluidConcierge: AI-Powered Travel Planning Platform

FluidConcierge là một hệ thống ứng dụng lập kế hoạch du lịch thông minh toàn diện, tích hợp kiến trúc **Microservices** giữa **Java Spring Boot 3.x**, **Python FastAPI AI Microservice** và **React 18 TypeScript Frontend**.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Java%2021%20%7C%20Spring%20Boot%203.x-blue)
![AI Service](https://img.shields.io/badge/AI%20Service-Python%20FastAPI%20%7C%20Clean%20Architecture-orange)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-blueviolet)

---

## 🏗️ Kiến Trúc Hệ Thống (System Architecture)

```text
                        ┌─────────────────────────┐
                        │   React Frontend UI     │
                        │    (FluidConcierge)     │
                        └────────────┬────────────┘
                                     │
                                     ▼ (REST / SSE Streaming)
                        ┌─────────────────────────┐
                        │   Java Spring Boot      │
                        │  AI Orchestration Layer │
                        │     (tripplanner)       │
                        └────────────┬────────────┘
                                     │ (HTTP REST / Resilient WebClient)
                                     ▼
                        ┌─────────────────────────┐
                        │   Python FastAPI        │
                        │    AI Microservice      │
                        │      (ai_service)       │
                        └─────────────────────────┘
```

---

## ⚙️ Chi Tiết Các Thành Phần Microservices

### 1. ☕ Java Spring Boot AI Orchestration Layer (`tripplanner`)
Backend Java đóng vai trò trung tâm điều phối AI (AI Orchestrator):
- **Stateful Conversation Domain:** Lưu trữ lịch sử hội thoại chat (`Conversation`, `ConversationMessage`) theo phiên làm việc của từng chuyến đi.
- **Prompt Context Builder (`PromptContextBuilder`):** Tổng hợp lịch sử chat + thông tin chuyến đi hiện tại + hồ sơ người dùng + yêu cầu sửa đổi thành ngữ cảnh hoàn chỉnh.
- **Trip Merge Engine (`TripMergeEngine`):** Tái tạo và cập nhật từng phần của lịch trình (thay đổi 1 nhà hàng, tạo lại Ngày 2, điều chỉnh ngân sách) mà không phải tạo lại toàn bộ chuyến đi.
- **Resilient WebClient & SSE Streaming:** Quản lý timeout, retry policy và hỗ trợ luồng dữ liệu thời gian thực Server-Sent Events (SSE).
- **APIs:**
  - `POST /api/v1/chat`: Bắt đầu/gửi hội thoại chat.
  - `POST /api/v1/chat/{id}/continue`: Tiếp tục phiên chat.
  - `POST /api/v1/trips/{id}/modify`: Sửa đổi một phần lịch trình.
  - `GET /api/v1/chat/{id}/messages`: Lấy lịch sử tin nhắn.
  - `GET /api/v1/chat/{id}/stream`: Stream dữ liệu câu trả lời AI thời gian thực (SSE).

---

### 2. 🐍 Python AI Microservice (`ai_service`)
FastAPI AI Microservice được thiết kế theo chuẩn **Clean Architecture** qua 5 giai đoạn tiến hóa:

- **Phase 1: Clean Architecture & Pipeline Nodes**
  - Tách rời FastAPI routes, Business Logic, và LLM Gateways (`OpenAIGateway`, `OllamaGateway`).
  - Quản lý luồng qua Pipeline Nodes (`FetchUserNode`, `ParseNode`, `PersonalizationNode`, `RecommendationNode`, `TravelIntelligenceNode`, `PlanningNode`, `HistoryNode`).

- **Phase 2: Recommendation & Ranking Engine**
  - Trích xuất địa điểm theo danh mục (Attractions, Hotels, Restaurants) & chấm điểm tổng hợp (Ranking Engine).
  - Bộ kiểm tra & tự động sửa lỗi (Validation & Automatic Repair Loop).

- **Phase 3: Travel Intelligence Layer (TIL)**
  - `DestinationResolver`: Chuẩn hóa tên địa danh & tọa độ.
  - `HaversineRouteEngine`: Ma trận khoảng cách $N \times N$ & thời gian di chuyển theo phương tiện.
  - `StaticWeatherEngine`: Đánh giá thời tiết theo ngày.
  - `StandardBudgetEngine`: Bóc tách chi phí ăn ở, đi lại, vé tham quan.
  - `GreedyTimelineOptimizer`: Tự động sắp xếp thời gian tham quan tối ưu địa lý.

- **Phase 4: Real World Data Platform (RWDP)**
  - `PlaceMergeEngine`: Gộp địa điểm trùng lặp từ nhiều nguồn dựa trên tọa độ ($\le 100\text{m}$) và độ tương đồng tên ($\ge 0.85$).
  - `ProviderAggregator`: Đa nguồn Google Places, OpenStreetMap, Wikipedia và Static Dataset.
  - `InMemoryCache`: Bộ nhớ đệm TTL caching.

- **Phase 5: Conversational Planning Node & SSE Streaming**
  - `ModificationPlanningNode`: Tái sử dụng ngữ cảnh candidate places và ma trận khoảng cách từ `TripPipeline` để tạo lịch trình chỉnh sửa theo yêu cầu.
  - Endpoint `/ai/modify-itinerary` & `/ai/chat-stream` (StreamingResponse).

---

### 3. ⚛️ React TypeScript Frontend (`FluidConcierge`)
- **UI Framework:** React 18, TypeScript, Tailwind CSS, Material Design 3, Framer Motion.
- **Tính năng UI:** Trò chuyện tương tác với AI Concierge, xem bản đồ & lịch trình theo ngày, sửa đổi từng hoạt động và nhận phản hồi stream thời gian thực.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
Nhom1/
├── FluidConcierge/          # React TypeScript Frontend
├── tripplanner/             # Java 21 Spring Boot Core AI Orchestrator
│   ├── src/main/java/com/example/tripplanner/
│   │   ├── application/     # AiOrchestratorService, PromptContextBuilder, TripMergeEngine
│   │   ├── domain/          # Conversation, ConversationMessage, Trip models & ports
│   │   ├── infrastructure/  # JPA Entities, Repositories, Security & WebClient
│   │   └── interfaces/      # ChatController REST & SSE Streaming APIs
├── ai_service/              # Python FastAPI AI Microservice
│   ├── app/
│   │   ├── application/     # Pipeline Nodes (inc. ModificationPlanningNode)
│   │   ├── domain/          # Entities & Interfaces
│   │   ├── infrastructure/  # Real World Data Providers & Route/Weather/Budget Engines
│   │   ├── pipelines/       # TripPipeline & ParsePipeline
│   │   └── services/        # Travel Intelligence & Recommendation Services
│   ├── tests/               # Pytest Suite (22 Test Modules)
│   └── main.py              # FastAPI Entrypoint
└── README.md                # Master Documentation File
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### 1. Khởi chạy AI Microservice (FastAPI - Port 8000)
```bash
cd ai_service
python -m venv venv

# Activate Virtual Environment:
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### 2. Khởi chạy Core AI Orchestrator (Spring Boot - Port 8081)
```bash
cd tripplanner
./mvnw spring-boot:run
```

### 3. Khởi chạy Frontend UI (React - Port 5173)
```bash
cd FluidConcierge
npm install
npm run dev
```

---

## 🧪 Automated Testing

Chạy bộ kiểm thử tự động của `ai_service`:

```bash
cd ai_service
pytest -o asyncio_mode=auto
```
