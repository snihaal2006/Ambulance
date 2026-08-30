package com.pulseroute.backend.service;

import com.pulseroute.backend.entity.Ambulance;
import com.pulseroute.backend.entity.AmbulanceStatus;
import com.pulseroute.backend.repository.AmbulanceRepository;
import com.pulseroute.backend.dto.AmbulanceDTO;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AmbulanceService {
    @Autowired
    private AmbulanceRepository repository;

    private AmbulanceDTO mapToDTO(Ambulance e) {
        AmbulanceDTO dto = new AmbulanceDTO();
        dto.id = e.getId();
        dto.ambulanceCode = e.getAmbulanceCode();
        dto.driverName = e.getDriverName();
        dto.registrationNumber = e.getRegistrationNumber();
        dto.latitude = e.getLatitude();
        dto.longitude = e.getLongitude();
        dto.status = e.getStatus();
        dto.lastUpdated = e.getLastUpdated();
        return dto;
    }

    public List<AmbulanceDTO> getAll() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    
    public AmbulanceDTO getById(Long id) {
        return repository.findById(id).map(this::mapToDTO).orElse(null);
    }
    
        public void updateStatus(String code, com.pulseroute.backend.entity.AmbulanceStatus status) {
        Ambulance amb = repository.findByAmbulanceCode(code);
        if (amb != null) {
            amb.setStatus(status);
            repository.save(amb);
        }
    }

    public List<AmbulanceDTO> getAvailable() {
        return repository.findByStatus(AmbulanceStatus.AVAILABLE).stream().map(this::mapToDTO).collect(Collectors.toList());
    }
}
