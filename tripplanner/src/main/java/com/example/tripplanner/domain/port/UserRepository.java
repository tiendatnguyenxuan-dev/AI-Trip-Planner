package com.example.tripplanner.domain.port;

import com.example.tripplanner.domain.model.User;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(String email);
    boolean existsById(UUID id);
    boolean existsByEmail(String email);
    User save(User user);
    java.util.List<User> findAll();
    void deleteById(UUID id);
}
