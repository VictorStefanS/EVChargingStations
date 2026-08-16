package com.EVCharge.dto;

import com.EVCharge.model.SessionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargingSessionDto {
    private Long id;
    private Long userId;
    private String userEmail;
    private Long stationId;
    private String stationName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double energyConsumedKwh;
    private SessionStatus status;
}
