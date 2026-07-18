package com.EVCharge.repository;

import com.EVCharge.model.ChargingSession;
import com.EVCharge.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    Optional<ChargingSession> findByUserIdAndStatus(Long userId, SessionStatus status);
    List<ChargingSession> findByUserIdOrderByStartTimeDesc(Long userId);
}
