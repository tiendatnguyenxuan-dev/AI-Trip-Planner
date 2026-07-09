# PLAN: JWT Authentication with Refresh Token Rotation & Redis Session

Dự án này sẽ tích hợp cơ chế bảo mật cấp độ Production bao gồm Access Token ngắn hạn, Refresh Token dài hạn, cơ chế quay vòng Token (Rotation), phát hiện sử dụng lại Token cũ (Reuse Detection), và quản lý phiên hoạt động đa thiết bị (Session Management) được lưu tại Redis.

---

## 1. Các Quyết Định Thiết Kế (Architectural Decisions)

1. **Redis Starter**: Sử dụng `spring-boot-starter-data-redis` cho lưu trữ session.
2. **Refresh Token Hash**: Lưu trữ mã SHA-256 của Refresh Token trong Redis thay vì lưu text thuần túy để đảm bảo an toàn.
3. **Session Store**:
   - Định dạng key: `session:{sessionId}`
   - Dữ liệu lưu: `sessionId`, `userId`, `refreshTokenHash`, `deviceInfo`, `ipAddress`, `createdAt`, `expiresAt`.
   - TTL: Khớp với thời gian sống của Refresh Token (30 ngày).
4. **Isolate Cookie vs Body**: 
   - Refresh Token sẽ được trả về dưới dạng HttpOnly, Secure Cookie nếu dự án hỗ trợ, hoặc trả về trong Response Body nhưng được đóng gói riêng để dễ dàng di chuyển sang Cookie sau này.

---

## 2. Câu Hỏi Làm Rõ (Socratic Gate / Open Questions)

> [!IMPORTANT]
> 1. **Cách truyền Refresh Token**: Bạn có muốn chuyển Refresh Token sang HttpOnly Cookie ngay lập tức trong đợt triển khai này hay trả về ở Response Body trước (rồi phía Frontend lưu vào LocalStorage/Cookie thủ công)?
> 2. **Cấu hình Redis local**: Bạn đã cài đặt và khởi chạy dịch vụ Redis tại local (`localhost:6379`) chưa, hay muốn sử dụng cấu hình tích hợp/Docker Compose có sẵn của dự án?
> 3. **Phân tích Device Info**: Để lấy thông tin thiết bị (User-Agent), chúng ta có cần thêm thư viện phân tích (như `uap-java`) hay chỉ cần trích xuất trực tiếp chuỗi Header `User-Agent` thô và địa chỉ IP của Client?

---

## 3. Các File Sẽ Sửa Đổi & Thêm Mới

### Backend (`tripplanner`)

#### [MODIFY] [pom.xml](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/pom.xml)
- Thêm dependency `spring-boot-starter-data-redis`.

#### [MODIFY] [application.yml](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/src/main/resources/application.yml)
- Bổ sung cấu hình JWT (secrets và expiration cho Access Token + Refresh Token).
- Bổ sung cấu hình kết nối Redis.

#### [NEW] [RedisConfig.java](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/src/main/java/com/example/tripplanner/infrastructure/config/RedisConfig.java)
- Tạo cấu hình `RedisTemplate` để làm việc với dữ liệu JSON session.

#### [NEW] [RedisSessionStore.java](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/src/main/java/com/example/tripplanner/infrastructure/security/RedisSessionStore.java)
- Triển khai lưu, lấy, xoá session trong Redis.

#### [NEW] [UserSession.java](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/src/main/java/com/example/tripplanner/domain/model/UserSession.java)
- Khai báo thực thể session lưu trữ.

#### [MODIFY] [JwtTokenProvider.java](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/src/main/java/com/example/tripplanner/infrastructure/security/JwtTokenProvider.java)
- Tách biệt logic Access Token và Refresh Token (khác secret, claims chứa `sessionId`).

#### [NEW] [AuthExceptions.java](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/src/main/java/com/example/tripplanner/domain/exception/AuthExceptions.java)
- Tạo `InvalidRefreshTokenException`, `ExpiredRefreshTokenException`, `SessionNotFoundException`, và `RefreshTokenReuseDetectedException`.

#### [MODIFY] [AuthController.java](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/tripplanner/src/main/java/com/example/tripplanner/presentation/controller/AuthController.java)
- Thêm API POST `/api/v1/auth/refresh` và xử lý Logout xóa session.

### Frontend (`FluidConcierge`)

#### [MODIFY] [api.ts](file:///d:/WORKSPACE/PROJECT%20JAVA/Nhom1/FluidConcierge/src/services/api.ts)
- Cập nhật Axios interceptor xử lý hàng đợi (queue) các request khi có lỗi 401, tự động call `/auth/refresh` để nhận token mới và retry các request đang chờ.

---

## 4. Kế Hoạch Xác Minh (Verification Plan)

### Automated Tests (Backend)
- Viết unit test trong `tripplanner/src/test` kiểm thử luồng Login, Refresh Token Rotation, Phát hiện sử dụng lại Token cũ (Reuse Detection), đa thiết bị (Multiple sessions).

### Manual Verification
- Chạy ứng dụng Frontend + Backend, đăng nhập từ 2 trình duyệt khác nhau (Chrome và Firefox) để kiểm chứng tính năng đa thiết bị, sau đó ngắt kết nối mạng/đợi token hết hạn để kiểm tra cơ chế tự động làm mới token.
