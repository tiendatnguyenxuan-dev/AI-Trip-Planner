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
}
