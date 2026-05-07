package com.example.tripplanner.domain.port;

import com.example.tripplanner.domain.model.Comment;
import java.util.List;
import java.util.UUID;

public interface CommentRepository {
    Comment save(Comment comment);
    List<Comment> findBySharedContentId(UUID sharedContentId);
}
