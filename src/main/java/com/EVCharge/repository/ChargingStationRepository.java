package com.EVCharge.backend.repository;

import com.EVCharge.backend.model.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {
    boolean existsByLatitudeAndLongitude(Double latitude, Double longitude);
}
