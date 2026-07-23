package com.EVCharge.backend.controller;

import com.EVCharge.backend.dto.ChargingSessionDto;
import com.EVCharge.backend.model.ChargingSession;
import com.EVCharge.backend.service.ChargingSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ChargingSessionController {

    private final ChargingSessionService chargingSessionService;

    @PostMapping("/start")
    public ResponseEntity<ChargingSessionDto> startSession(
            @RequestParam Long stationId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ChargingSession session = chargingSessionService.startSession(stationId, userDetails.getUsername());

        ChargingSessionDto response = mapToDto(session);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/stop")
    public ResponseEntity<ChargingSessionDto> stopSession(
            @AuthenticationPrincipal UserDetails userDetails
    ){
        ChargingSession session = chargingSessionService.stopSession(userDetails.getUsername());
        ChargingSessionDto response = mapToDto(session);
        return ResponseEntity.ok(response);
    }

    private ChargingSessionDto mapToDto(ChargingSession session) {
        return ChargingSessionDto.builder()
                .id(session.getId())
                .userId(session.getUser().getId())
                .userEmail(session.getUser().getEmail())
                .stationName(session.getChargingStation().getName())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .energyConsumedKwh(session.getEnergyConsumedKwh())
                .status(session.getStatus())
                .build();
    }

    @GetMapping
    public ResponseEntity<List<ChargingSessionDto>> getSessionHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ChargingSession> sessions = chargingSessionService.getUserSessionHistory(userDetails.getUsername());

        List<ChargingSessionDto> response = sessions.stream()
                .map(this::mapToDto)
                .toList();

        return ResponseEntity.ok(response);
    }



}
