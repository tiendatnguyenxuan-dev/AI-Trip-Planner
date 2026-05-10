package com.example.tripplanner.domain.port;

import com.example.tripplanner.domain.model.ShareType;
import com.example.tripplanner.domain.model.SharedContent;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SharedContentRepository {
    SharedContent save(SharedContent sharedContent);
    Optional<SharedContent> findById(UUID id);
    List<SharedContent> getTrending(ShareType type, int limit);
    boolean existsByUser_IdAndRefIdAndType(UUID userId, UUID refId, ShareType type);
    List<SharedContent> findByRefId(UUID refId);
    List<SharedContent> findAllPending();
    List<SharedContent> findByStatus(com.example.tripplanner.domain.model.ShareStatus status);
    List<SharedContent> findByUserId(UUID userId);
    void deleteById(UUID id);
}
