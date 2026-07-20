package com.EVCharge.controller;


import com.EVCharge.dto.ChargingStationDto;
import com.EVCharge.model.ChargingStation;
import com.EVCharge.model.StationStatus;
import com.EVCharge.model.User;
import com.EVCharge.service.ChargingStationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
public class ChargingStationController {
    private final ChargingStationService chargingStationService;

    @GetMapping("/stations")
    public ResponseEntity<List<ChargingStation>> getAllChargingStations() {
        return new ResponseEntity<>(chargingStationService.getAllStations(), HttpStatus.OK);
    }


    @PostMapping("/stations")
    public ResponseEntity<ChargingStation> createStation(@Valid @RequestBody ChargingStationDto chargingStationDto,@AuthenticationPrincipal User user) {
        ChargingStation createdStation = chargingStationService.createStation(chargingStationDto, user);
        return new ResponseEntity<>(createdStation, HttpStatus.CREATED);
    }

    @PatchMapping("/stations/{id}/status")
    public ResponseEntity<ChargingStation> updateStatus(
            @PathVariable Long id,
            @RequestParam StationStatus status) {

        ChargingStation updatedStation = chargingStationService.updateStation(id, status);
        return new ResponseEntity<>(updatedStation, HttpStatus.OK);
    }
}
