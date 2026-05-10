package com.example.tripplanner.application.usecase.trip;

import com.example.tripplanner.application.dto.TripRequest;
import com.example.tripplanner.application.dto.TripResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Trip;
import com.example.tripplanner.domain.model.TripStatus;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.port.TripRepository;
import com.example.tripplanner.domain.port.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreateTripUseCase {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public TripResponse execute(TripRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + request.getUserId()));

        java.time.LocalDate now = java.time.LocalDate.now();
        if (request.getStartDate().isBefore(now)) {
            throw new IllegalArgumentException("Ngày khởi hành không được ở trong quá khứ");
        }
        if (request.getStartDate().isAfter(now.plusYears(1))) {
            throw new IllegalArgumentException("Chỉ có thể lên kế hoạch cho chuyến đi trong vòng 1 năm tới");
        }

        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (totalDays > 7) {
            throw new IllegalArgumentException("Thời gian chuyến đi không được quá 7 ngày");
        }
        if (totalDays <= 0) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau hoặc bằng ngày khởi hành");
        }

        Trip trip = Trip.builder()
                .user(user)
                .title(request.getTitle())
                .destination(request.getDestination())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .budget(request.getBudget())
                .status(TripStatus.PLANNING)
                .build();

        return TripMapper.toResponse(tripRepository.save(trip));
    }
}

