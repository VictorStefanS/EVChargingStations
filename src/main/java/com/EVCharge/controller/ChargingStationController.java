package com.EVCharge.controller;


import com.EVCharge.dto.ChargingStationDto;
import com.EVCharge.model.ChargingStation;
import com.EVCharge.service.ChargingStationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
public class ChargingStationController {
    private final ChargingStationService chargingStationService;

    @PostMapping("/stations")
    public ResponseEntity<ChargingStation> createStation(@RequestBody ChargingStationDto chargingStationDto) {
        ChargingStation createdStation = chargingStationService.createStation(chargingStationDto);
        return new ResponseEntity<>(createdStation, HttpStatus.CREATED);
    }
}
