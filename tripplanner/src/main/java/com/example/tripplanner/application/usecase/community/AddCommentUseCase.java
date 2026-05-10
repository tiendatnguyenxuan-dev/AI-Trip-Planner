package com.example.tripplanner.application.usecase.community;

import com.example.tripplanner.application.dto.CommentRequest;
import com.example.tripplanner.application.dto.CommentResponse;
import com.example.tripplanner.application.mapper.TripMapper;
import com.example.tripplanner.domain.model.Comment;
import com.example.tripplanner.domain.model.SharedContent;
import com.example.tripplanner.domain.model.User;
import com.example.tripplanner.domain.port.CommentRepository;
import com.example.tripplanner.domain.port.SharedContentRepository;
import com.example.tripplanner.domain.port.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddCommentUseCase {

    private final CommentRepository commentRepository;
    private final SharedContentRepository sharedContentRepository;
    private final UserRepository userRepository;

    @Transactional
    public CommentResponse execute(UUID userId, UUID contentId, CommentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SharedContent content = sharedContentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Shared content not found"));

        Comment comment = Comment.builder()
                .sharedContentId(content.getId())
                .user(user)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        Comment saved = commentRepository.save(comment);

        return CommentResponse.builder()
                .id(saved.getId())
                .sharedContentId(saved.getSharedContentId())
                .user(TripMapper.toUserResponse(saved.getUser()))
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
