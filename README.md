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
                                     ▼
                        ┌─────────────────────────┐
                        │   Java Spring Boot      │
                        │   Core API Service      │
                        │     (tripplanner)       │
                        └────────────┬────────────┘
                                     │ (HTTP REST / WebClient)
                                     ▼
                        ┌─────────────────────────┐
                        │   Python FastAPI        │
                        │    AI Microservice      │
                        │      (ai_service)       │
                        └─────────────────────────┘
```

---

## ⚙️ Chi Tiết Các Thành Phần Microservices

### 1. 🐍 Python AI Microservice (`ai_service`)
Đảm nhận phân tích ngôn ngữ tự nhiên, gợi ý địa điểm, tính toán ma trận khoảng cách địa lý và lập lịch trình du lịch khả thi. Được thiết kế theo chuẩn **Clean Architecture** qua 4 giai đoạn tiến hóa:

- **Phase 1: Clean Architecture & Pipeline Nodes**
  - Tách rời giao diện FastAPI, Business Logic, và LLM Gateway (`OpenAIGateway`, `OllamaGateway`).
  - Quản lý luồng xử lý qua các Pipeline Nodes: `FetchUserNode`, `ParseNode`, `PersonalizationNode`, `RecommendationNode`, `TravelIntelligenceNode`, `PlanningNode`, `HistoryNode`.
  - Quản lý phụ thuộc qua Composition Root Container (`di.py`).

- **Phase 2: Recommendation & Ranking Engine**
  - Trích xuất địa điểm theo các danh mục: Attractions, Hotels, Restaurants.
  - Chấm điểm kết hợp (Ranking Engine): Đánh giá rating, số lượng review, mức độ phù hợp tag/vibe và sở thích người dùng.
  - Bộ kiểm tra & tự động sửa lỗi (Validation & Automatic Repair Loop) đảm bảo lịch trình không vượt ngân sách.

- **Phase 3: Travel Intelligence Layer (TIL)**
  - **Destination Resolution:** Chuẩn hóa tên địa danh, sửa lỗi chính tả & aliases ("Saigon", "TPHCM", "HCMC") về `DestinationEntity`.
  - **Geographic Distance Matrix:** Tính toán ma trận khoảng cách (Haversine formula) & thời gian di chuyển giữa các địa điểm theo các phương tiện (`WALKING`, `MOTORBIKE`, `CAR`, `PUBLIC_TRANSIT`).
  - **Weather Suitability Engine:** Đánh giá thời tiết theo ngày và cảnh báo rủi ro hoạt động ngoài trời.
  - **Itemized Budget Engine:** Bóc tách dự toán chi tiết cho Ăn ở, Ăn uống, Di chuyển, Vé tham quan.
  - **Deterministic Timeline Optimization:** Tự động lập lịch trình di chuyển tối ưu khoảng cách (Nearest Neighbor) và thời lượng tham quan thực tế.

- **Phase 4: Real World Data Platform (RWDP)**
  - **Rich Metadata & Provenance:** Hỗ trợ thông tin mở rộng (số điện thoại, website, bài viết tổng hợp, trạng thái hoạt động) và lưu vết nguồn dữ liệu (`ProvenanceInfo`).
  - **POI Deduplication & Merge Engine:** Tự động gộp địa điểm trùng lặp từ nhiều nguồn dựa trên khoảng cách tọa độ ($\le 100\text{m}$) và độ tương đồng tên ($\ge 0.85$).
  - **Multi-Provider Aggregator:** Tổng hợp song song dữ liệu từ Google Places, OpenStreetMap, Wikipedia và Static Dataset fallback.
  - **Provider Caching Layer:** Bộ nhớ đệm TTL `InMemoryCache` giúp tối ưu tốc độ và chi phí gọi API.

---

### 2. ☕ Java Spring Boot Backend (`tripplanner`)
Đóng vai trò Core Service quản lý dữ liệu người dùng, bài viết, lưu trữ Database và đóng vai trò Gateway giao tiếp với AI Service:

- **Quản lý Trips & Daily Itinerary:** CRUD chuyến đi, lịch trình chi tiết từng ngày và lưu vết history.
- **Integration Client:** Gửi yêu cầu câu hỏi tự nhiên từ Client sang `ai_service` (port 8000) qua `WebClient` / `RestTemplate` và nhận kết quả TripPlanResponse đã qua làm giàu dữ liệu để lưu DB.
- **Tech Stack:** Java 21, Spring Boot 3.x, Spring Data JPA, H2 / PostgreSQL.

---

### 3. ⚛️ React TypeScript Frontend (`FluidConcierge`)
- **UI Framework:** React 18, TypeScript, Tailwind CSS, Material Design 3.
- **Animations & Icons:** Framer Motion, Lucide React icons.
- **Tính năng UI:** Nhập yêu cầu du lịch tự nhiên, xem bản đồ & lịch trình chuyến đi theo ngày, chỉnh sửa hoạt động và xem dự toán chi phí.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
Nhom1/
├── FluidConcierge/          # React TypeScript Frontend
├── tripplanner/             # Java 21 Spring Boot Core Backend
├── ai_service/              # Python FastAPI AI Microservice
│   ├── app/
│   │   ├── api/             # FastAPI Routes
│   │   ├── application/     # Pipeline Nodes
│   │   ├── domain/          # Entities & Interfaces
│   │   ├── infrastructure/  # Providers, Gateways, Repositories, Cache
│   │   ├── pipelines/       # TripPipeline & ParsePipeline
│   │   ├── services/        # Travel Intelligence & Recommendation Services
│   │   └── shared/          # Container DI & TripContext
│   ├── tests/               # Pytest Suite (20 Test Modules)
│   └── main.py              # FastAPI Entrypoint
└── README.md                # Master Documentation File
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### 1. Khởi chạy AI Microservice (FastAPI - Port 8000)
```bash
cd ai_service
python -m venv venv

# Active Virtual Environment:
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

### 2. Khởi chạy Core Backend (Spring Boot - Port 8081)
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

Chạy bộ kiểm thử tự động 20 test cases của `ai_service`:

```bash
cd ai_service
pytest -o asyncio_mode=auto
```
