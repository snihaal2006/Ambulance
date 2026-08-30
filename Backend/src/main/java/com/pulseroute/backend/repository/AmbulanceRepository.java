package com.pulseroute.backend.repository;

import com.pulseroute.backend.entity.Ambulance;
import com.pulseroute.backend.entity.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
    List<Ambulance> findByStatus(AmbulanceStatus status);
    Ambulance findByAmbulanceCode(String code);
}
