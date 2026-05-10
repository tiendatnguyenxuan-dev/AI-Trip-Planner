package com.example.tripplanner.application.usecase.community;

import com.example.tripplanner.application.dto.CommentResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.port.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetCommentsUseCase {

    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public List<CommentResponse> execute(UUID contentId) {
        return commentRepository.findBySharedContentId(contentId).stream()
                .map(comment -> CommentResponse.builder()
                        .id(comment.getId())
                        .sharedContentId(comment.getSharedContentId())
                        .user(TripMapper.toUserResponse(comment.getUser()))
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
