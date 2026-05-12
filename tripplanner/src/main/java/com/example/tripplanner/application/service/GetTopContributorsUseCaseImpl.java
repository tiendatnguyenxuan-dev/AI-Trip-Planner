package com.example.tripplanner.application.service;

import com.example.tripplanner.application.dto.ContributorResponse;
import com.example.tripplanner.application.usecase.community.GetTopContributorsUseCase;
import com.example.tripplanner.infrastructure.persistence.entity.UserEntity;
import com.example.tripplanner.infrastructure.persistence.repository.JpaSharedContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetTopContributorsUseCaseImpl implements GetTopContributorsUseCase {

    private final JpaSharedContentRepository jpaSharedContentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ContributorResponse> execute(int limit) {
        List<Object[]> results = jpaSharedContentRepository.findTopContributors(PageRequest.of(0, limit));

        return results.stream().map(result -> {
            UserEntity userEntity = (UserEntity) result[0];
            long postCount = ((Number) result[1]).longValue();
            long totalLikes = ((Number) result[2]).longValue();

            return ContributorResponse.builder()
                    .userId(userEntity.getId())
                    .name(userEntity.getName())
                    .email(userEntity.getEmail())
                    .contributionCount(postCount)
                    .totalImpact(totalLikes)
                    .build();
        }).collect(Collectors.toList());
    }
}
