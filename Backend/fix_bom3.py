with open("src/main/java/com/pulseroute/backend/repository/EmergencyCaseRepository.java", "w", encoding="utf-8", newline='\n') as f:
    f.write('''package com.pulseroute.backend.repository;

import com.pulseroute.backend.entity.EmergencyCase;
import com.pulseroute.backend.entity.EmergencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmergencyCaseRepository extends JpaRepository<EmergencyCase, Long> {
    List<EmergencyCase> findByStatusNot(EmergencyStatus status);
    List<EmergencyCase> findByAssignedAmbulanceIdAndStatusIn(Long ambulanceId, List<EmergencyStatus> statuses);
    EmergencyCase findByCaseNumber(String caseNumber);
}
''')
