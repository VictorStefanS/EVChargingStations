package com.EVCharge.backend.repository;

import com.EVCharge.backend.model.ChargingSession;
import com.EVCharge.backend.model.SessionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {

    @EntityGraph(attributePaths = {"chargingStation", "user"})
    Optional<ChargingSession> findByUserIdAndStatus(Long userId, SessionStatus status);

    @EntityGraph(attributePaths = {"chargingStation", "user"})
    List<ChargingSession> findByUserIdOrderByStartTimeDesc(Long userId);
}