package com.EVCharge.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name ="Charging_Stations")
@NoArgsConstructor @AllArgsConstructor @Getter
@Setter
public class ChargingStation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private StationStatus status;

    private Double latitude;
    private Double longitude;

    @ManyToOne
    private User createdBy;
}
