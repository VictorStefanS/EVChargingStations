package com.EVCharge.repository;

import com.EVCharge.model.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {
    boolean existsByLatitudeAndLongitude(Double latitude, Double longitude);

    // native query to find stations within radius (km) using Haversine formula
    @Query(value = "SELECT * FROM Charging_Stations s WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(s.latitude)))) <= :radius ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(s.latitude))))", nativeQuery = true)
    List<ChargingStation> findNearby(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radius);
}
