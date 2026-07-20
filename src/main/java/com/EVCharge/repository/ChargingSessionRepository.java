package com.EVCharge.repository;

import com.EVCharge.model.ChargingSession;
import com.EVCharge.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {
    Optional<ChargingSession> findByUserIdAndStatus(Long userId, SessionStatus status);
    @Query("SELECT s FROM ChargingSession s " +
            "JOIN FETCH s.station " +
            "JOIN FETCH s.user " +
            "WHERE s.user.id = :userId " +
            "ORDER BY s.startTime DESC")
    List<ChargingSession> findByUserIdOrderByStartTimeDesc(@Param("userId") Long userId);
}
