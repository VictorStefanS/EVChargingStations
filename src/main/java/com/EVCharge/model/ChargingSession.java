package com.EVCharge.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Charging_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private ChargingStation chargingStation;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "energy_consumed_kwh")
    private Double energyConsumedKwh;

    @Enumerated(EnumType.STRING)
    @Column( nullable = false)
    private SessionStatus status;

}
