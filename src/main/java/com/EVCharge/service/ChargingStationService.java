package com.EVCharge.backend.service;


import com.EVCharge.backend.dto.ChargingStationDto;
import com.EVCharge.backend.model.ChargingStation;
import com.EVCharge.backend.model.StationStatus;
import com.EVCharge.backend.model.User;
import com.EVCharge.backend.repository.ChargingStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository chargingStationRepository;


    public List<ChargingStation> getAllStations() {
        return chargingStationRepository.findAll();
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
