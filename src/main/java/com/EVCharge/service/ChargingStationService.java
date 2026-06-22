package com.EVCharge.service;


import com.EVCharge.dto.ChargingStationDto;
import com.EVCharge.model.ChargingStation;
import com.EVCharge.model.StationStatus;
import com.EVCharge.repository.ChargingStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository chargingStationRepository;


    public List<ChargingStation> getAllStations() {
        return chargingStationRepository.findAll();
    }

    public ChargingStation createStation(ChargingStationDto chargingStationDto) {
        if(chargingStationRepository.existsByLatitudeAndLongitude(chargingStationDto.getLatitude(), chargingStationDto.getLongitude())) {
            throw new RuntimeException("Station already exists");
        }
        ChargingStation chargingStation = new ChargingStation();
        chargingStation.setName(chargingStationDto.getName());
        chargingStation.setLatitude(chargingStationDto.getLatitude());
        chargingStation.setLongitude(chargingStationDto.getLongitude());
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
