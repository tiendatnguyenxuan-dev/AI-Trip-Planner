package com.example.tripplanner.application.usecase.community;

import com.example.tripplanner.application.dto.ContributorResponse;
import java.util.List;

public interface GetTopContributorsUseCase {
    List<ContributorResponse> execute(int limit);
}
