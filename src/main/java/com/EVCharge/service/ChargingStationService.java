package com.EVCharge.service;


import com.EVCharge.dto.ChargingStationDto;
import com.EVCharge.model.ChargingStation;
import com.EVCharge.model.StationStatus;
import com.EVCharge.model.User;
import com.EVCharge.repository.ChargingStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.EVCharge.dto.ChargingStationWithDistanceDto;

@Service @RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository chargingStationRepository;


    public List<ChargingStation> getAllStations() {
        return chargingStationRepository.findAll();
    }

    public List<ChargingStation> getNearbyStations(double latitude, double longitude, double radiusKm) {
        // radiusKm: distance in kilometers
        return chargingStationRepository.findNearby(latitude, longitude, radiusKm);
    }

    public List<ChargingStationWithDistanceDto> getNearbyStationsWithDistance(double latitude, double longitude, double radiusKm) {
        List<Object[]> rows = chargingStationRepository.findNearbyWithDistance(latitude, longitude, radiusKm);
        return rows.stream().map(r -> {
            // r: [id, name, latitude, longitude, distance]
            Long id = r[0] == null ? null : ((Number) r[0]).longValue();
            String name = r[1] == null ? null : r[1].toString();
            Double lat = r[2] == null ? null : ((Number) r[2]).doubleValue();
            Double lng = r[3] == null ? null : ((Number) r[3]).doubleValue();
            Double dist = r[4] == null ? null : ((Number) r[4]).doubleValue();
            return new ChargingStationWithDistanceDto(id, name, lat, lng, dist);
        }).collect(Collectors.toList());
    }

    public ChargingStation createStation(ChargingStationDto chargingStationDto, User user) {
        if(chargingStationRepository.existsByLatitudeAndLongitude(chargingStationDto.getLatitude(), chargingStationDto.getLongitude())) {
            throw new RuntimeException("Station already exists");
        }
        ChargingStation chargingStation = new ChargingStation();
        chargingStation.setName(chargingStationDto.getName());
        chargingStation.setLatitude(chargingStationDto.getLatitude());
        chargingStation.setLongitude(chargingStationDto.getLongitude());
        chargingStation.setCreatedBy(user);
        chargingStation.setStatus(StationStatus.AVAILABLE);
        chargingStationRepository.save(chargingStation);
        return chargingStation;
    }

    public ChargingStation updateStation(Long id, StationStatus stationStatus) {
        ChargingStation chargingStation = chargingStationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found with id: " + id));

        chargingStation.setStatus(stationStatus);
        return chargingStationRepository.save(chargingStation);
    }

}
