# ✈️ FluidConcierge: AI-Powered Travel Planning & Closed-Loop Community Platform

FluidConcierge là một hệ thống ứng dụng lập kế hoạch du lịch thông minh toàn diện, tích hợp kiến trúc **Microservices** giữa **Java Spring Boot 3.x**, **Python FastAPI AI Microservice** và **React 18 TypeScript Frontend**.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Java%2021%20%7C%20Spring%20Boot%203.x-blue)
![AI Service](https://img.shields.io/badge/AI%20Service-Python%20FastAPI%20%7C%20Clean%20Architecture-orange)
![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-blueviolet)

---

## 🏛️ Vòng Lặp Khép Kín "Chất Riêng" Của FluidConcierge (Closed-Loop Experience)

```text
Community Trip (SharedContent)
        │
        ▼
Save as Draft
        │
        ▼
Edit & Remix with AI (Conversational Planning)
        │
        ▼
Personalized Trip
        │
        ▼
Travel & Experience
        │
        ▼
Publish Back to Community (/api/v1/community/share)
        │
        └──────────────► Community Feed (/api/v1/community/trending)
```

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

## ⚙️ Các Tính Năng Đổi Mới Nổi Bật Qua 6 Phase Tiến Hóa

### 1. ⚛️ Phase 6: Interactive Travel Experience & Community Platform (`FluidConcierge`)
- **Bản Đồ Tương Tác (`InteractiveMap.tsx`)**: Tích hợp Leaflet & OpenStreetMap, hiển thị markers theo từng hoạt động, vẽ đường đi bằng Polylines và tự động tính toán viewport bounds.
- **Đồng Bộ Hai Chiều Map ↔ Timeline (`SyncTimelineView.tsx`)**: Click vào hoạt động ở timeline sẽ tự động xoay bản đồ và highlight marker; click vào marker trên bản đồ sẽ cuộn timeline và mở card xem trước.
- **Place Preview Card Overlay (`PlacePreviewCard.tsx`)**: Hiển thị ảnh, đánh giá, số điện thoại, website, chi phí và chỉ đường.
- **Vòng Lặp Tái Sử Dụng AI (`RemixTripModal.tsx`)**: Cho phép người dùng nhấp **"Tái sử dụng bằng AI"** trên bất kỳ bài đăng nào của cộng đồng để tự động chuyển thành bản nháp và tùy chỉnh bằng AI Chat.
- **Community Feed (`CommunityFeed.tsx`)**: Kết nối trực tiếp với backend Java `SharedContent` (`/api/v1/community/trending`, `/share`, `/rate`, `/comments`).

### 2. ☕ Phase 5: Java Spring Boot AI Orchestrator (`tripplanner`)
- **Stateful Conversation Domain**: Lưu trữ phiên chat (`Conversation`, `ConversationMessage`).
- **Prompt Context Builder & Trip Merge Engine**: Đóng gói lịch sử + trip hiện tại gửi AI và gộp lịch trình chỉnh sửa từng phần mà không ảnh hưởng các ngày khác.
- **Resilience & SSE Streaming Gateway**: Timeout, retry và stream câu trả lời thời gian thực qua Server-Sent Events.

### 3. 🐍 Phase 1 - 4: Python FastAPI AI Microservice (`ai_service`)
- **Travel Intelligence Layer (TIL)**: Ma trận khoảng cách $N \times N$, dự báo thời tiết, itemized budget và Greedy Timeline Optimizer.
- **Real World Data Platform (RWDP)**: Gộp địa điểm trùng lặp (`PlaceMergeEngine`), đa nguồn Google Places/OSM/Wikipedia.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

### 1. Khởi chạy AI Microservice (FastAPI - Port 8000)
```bash
cd ai_service
python -m venv venv
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
mvn spring-boot:run
```

### 3. Khởi chạy Frontend UI (React - Port 5173)
```bash
cd FluidConcierge
npm install
npm run dev
```

---

## 🧪 Automated Testing

- **Python tests**: `pytest -o asyncio_mode=auto` (22 passed)
- **Java tests**: `mvn.cmd test` (25 passed)
- **React build**: `npm run build` (success)
