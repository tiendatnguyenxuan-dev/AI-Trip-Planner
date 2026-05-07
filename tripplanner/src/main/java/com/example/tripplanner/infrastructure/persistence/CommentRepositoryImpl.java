package com.example.tripplanner.infrastructure.persistence;

import com.example.tripplanner.domain.model.Comment;
import com.example.tripplanner.domain.port.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CommentRepositoryImpl implements CommentRepository {

    private final JpaCommentRepository jpaCommentRepository;
    private final PersistenceMapper mapper;

    @Override
    public Comment save(Comment comment) {
        CommentEntity entity = mapper.toEntity(comment);
        CommentEntity saved = jpaCommentRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<Comment> findBySharedContentId(UUID sharedContentId) {
        return jpaCommentRepository.findBySharedContentIdOrderByCreatedAtDesc(sharedContentId)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
