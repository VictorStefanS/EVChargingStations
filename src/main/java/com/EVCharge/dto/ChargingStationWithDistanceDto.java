package com.EVCharge.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChargingStationWithDistanceDto {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
}
