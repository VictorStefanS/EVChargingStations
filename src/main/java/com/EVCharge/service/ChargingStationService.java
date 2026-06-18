package com.EVCharge.service;


import com.EVCharge.dto.ChargingStationDto;
import com.EVCharge.model.ChargingStation;
import com.EVCharge.model.StationStatus;
import com.EVCharge.repository.ChargingStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository chargingStationRepository;


    public ChargingStation createStation(ChargingStationDto chargingStationDto) {
        ChargingStation chargingStation = new ChargingStation();

        chargingStation.setName(chargingStationDto.getName());
        chargingStation.setLatitude(chargingStationDto.getLatitude());
        chargingStation.setLongitude(chargingStationDto.getLongitude());
        chargingStation.setStatus(StationStatus.AVAILABLE);
        chargingStationRepository.save(chargingStation);
        return chargingStation;
    }

}
