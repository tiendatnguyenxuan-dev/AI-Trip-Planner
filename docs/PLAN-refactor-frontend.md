# PLAN: Refactor & Clean Code Frontend (FluidConcierge)

Dưới đây là kế hoạch chi tiết (Refactoring & Clean Code) cho toàn bộ Frontend (`FluidConcierge`) để tối ưu hóa cấu trúc thư mục, chuẩn hóa dữ liệu hardcoded, tách biệt Utilities, và module hóa Component.

---

## 1. Hiện Trạng & Vấn Đề Cần Giải Quyết

Qua rà soát nhanh các component chính (`Dashboard.tsx`, `Itinerary.tsx`, `Explore.tsx`, v.v.):
- **Dữ liệu Hardcoded nhiều nơi**:
  - `DESTINATION_IMAGES` và `getImageForDestination` lặp lại hoặc nằm trực tiếp trong file Component.
  - Các cấu hình nhãn trạng thái (`STATUS_LABELS`, `STATUS_CLASS`), cấu hình category style (`CATEGORY_STYLES`) nằm rải rác.
- **Hàm Utilities trùng lặp**:
  - Các hàm định dạng tiền tệ (`formatCurrency`), định dạng ngày tháng (`formatDate`), định dạng giờ (`formatTime`), và tính toán khoảng cách ngày (`calcDays`) được khai báo cục bộ ở từng component thay vì dùng chung.
- **Component quá lớn (Monolithic)**:
  - Một số file chứa cả component chính lẫn 3-4 sub-component con (ví dụ: `Itinerary.tsx` chứa `ActivityCard`, `DaySection`, `LoadingSkeleton`, `GeneratingOverlay`). Điều này làm file phình to (>600 dòng), khó viết Unit Test và bảo trì.
- **Mã cứng API Base URL**:
  - `apiClient` trong `services/api.ts` đang hardcode `'http://localhost:8090/api/v1'`. Nên chuyển sang biến môi trường `.env`.

---

## 2. Đề Xuất Cấu Trúc Thư Mục Mới (Standardized Structure)

```text
src/
├── components/
│   ├── dashboard/           # Tách nhỏ Dashboard sub-components
│   │   ├── TripCard.tsx
│   │   └── TripCardSkeleton.tsx
│   ├── itinerary/           # Tách nhỏ Itinerary sub-components
│   │   ├── ActivityCard.tsx
│   │   ├── DaySection.tsx
│   │   ├── LoadingSkeleton.tsx
│   │   └── GeneratingOverlay.tsx
│   └── ui/                  # Các UI primitive dùng chung (nếu cần)
├── constants/
│   ├── index.ts             # Điểm tập hợp toàn bộ hằng số
│   ├── trip.ts              # STATUS_LABELS, STATUS_CLASS, STYLE_OPTIONS...
│   └── images.ts            # DESTINATION_IMAGES, HERO_BGS...
├── utils/
│   ├── formatter.ts         # formatCurrency, formatDate, formatTime
│   ├── date.ts              # calcDays
│   └── helper.ts            # getImageForDestination
```

---

## 3. Kế Hoạch Các Bước Thực Hiện

### Phase 1: Trích xuất Utilities & Constants
- **Tạo `src/constants/trip.ts` và `src/constants/images.ts`**:
  - Di chuyển các map hằng số như `STATUS_LABELS`, `STATUS_CLASS`, `CATEGORY_STYLES`, `DESTINATION_IMAGES`, `HERO_BGS` ra ngoài.
- **Tạo `src/utils/`**:
  - Di chuyển `formatCurrency`, `formatDate`, `formatTime` vào `src/utils/formatter.ts`.
  - Di chuyển `calcDays` vào `src/utils/date.ts`.
  - Di chuyển `getImageForDestination` vào `src/utils/helper.ts`.
- **Cập nhật lại đường dẫn import** ở các Component hiện tại để đảm bảo không lỗi compiler.

### Phase 2: Modular hóa Component
- **Dashboard**:
  - Tách `TripCardSkeleton` ra file riêng.
- **Itinerary**:
  - Tách `ActivityCard`, `DaySection`, `LoadingSkeleton`, và `GeneratingOverlay` ra các file component riêng biệt trong `src/components/itinerary/`.
- **Explore**:
  - Tách các modal lồng nhau hoặc helper card nếu cần thiết.

### Phase 3: Cấu hình biến môi trường (.env)
- Tạo file `.env.example` và `.env` ở root của `FluidConcierge`.
- Khai báo: `VITE_API_BASE_URL=http://localhost:8090/api/v1` và `VITE_WS_URL=http://localhost:8090/ws`.
- Cập nhật `services/api.ts` và `hooks/useWebSocket.tsx` để đọc cấu hình qua `import.meta.env.VITE_...`.

---

## 4. Kế Hoạch Xác Minh (Verification Plan)

### Kiểm thử tự động (Automated Check)
- Chạy lệnh type check và build dự án:
  ```bash
  npm run build
  ```
  *(Đảm bảo không phát sinh bất kỳ lỗi import hay thiếu kiểu dữ liệu)*

### Kiểm thử thủ công (Manual Check)
- Mở Dashboard, Itinerary, và Explore trên local:
  - Đảm bảo hiển thị ảnh đại diện địa điểm chính xác.
  - Định dạng tiền tệ, ngày tháng hiển thị chuẩn vi-VN.
  - Tính năng Tạo chuyến đi, Trình chiếu hero bgs, Like/Vote hoạt động bình thường.
