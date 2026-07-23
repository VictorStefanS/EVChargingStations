package com.EVCharge.backend.service;

import com.EVCharge.backend.exceptions.ResourceNotFoundException;
import com.EVCharge.backend.config.model.*;
import com.EVCharge.backend.model.*;
import com.EVCharge.backend.repository.ChargingSessionRepository;
import com.EVCharge.backend.repository.ChargingStationRepository;
import com.EVCharge.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChargingSessionService {
    private final ChargingSessionRepository chargingSessionRepository;
    private final ChargingStationRepository chargingStationRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChargingSession startSession(Long stationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        chargingSessionRepository.findByUserIdAndStatus(user.getId(), SessionStatus.ACTIVE)
                .ifPresent(s -> {
                    throw new RuntimeException("User already has an active charging session. Please stop your current session before starting a new one.");
                });

        ChargingStation station = chargingStationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found"));

        if (station.getStatus() != StationStatus.AVAILABLE) {
            throw new RuntimeException("Charging station is not available (current status: " + station.getStatus() + ")");
        }
        station.setStatus(StationStatus.OCCUPIED);
        chargingStationRepository.save(station);

        ChargingSession session = ChargingSession.builder()
                .user(user)
                .chargingStation(station)
                .startTime(LocalDateTime.now())
                .status(SessionStatus.ACTIVE)
                .build();

        return chargingSessionRepository.save(session);
    }

    @Transactional
    public ChargingSession stopSession(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChargingSession session = chargingSessionRepository.findByUserIdAndStatus(user.getId(), SessionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active charging session found for this user"));

        session.setEndTime(LocalDateTime.now());

        long durationInSeconds = java.time.Duration.between(session.getStartTime(), session.getEndTime()).toSeconds();
        double hours = durationInSeconds / 3600.0;
        double energyConsumed = hours * 11.0;

        session.setEnergyConsumedKwh(Math.round(energyConsumed * 100.0) / 100.0);

        session.setStatus(SessionStatus.COMPLETED);

        ChargingStation station = session.getChargingStation();
        station.setStatus(StationStatus.AVAILABLE);
        chargingStationRepository.save(station);

        return chargingSessionRepository.save(session);
    }


    public List<ChargingSession> getUserSessionHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return chargingSessionRepository.findByUserIdOrderByStartTimeDesc(user.getId());
    }
}
