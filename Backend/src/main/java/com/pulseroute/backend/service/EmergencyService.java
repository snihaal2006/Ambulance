package com.pulseroute.backend.service;

import com.pulseroute.backend.entity.EmergencyCase;
import com.pulseroute.backend.entity.EmergencyStatus;
import com.pulseroute.backend.entity.Ambulance;
import com.pulseroute.backend.entity.AmbulanceStatus;
import com.pulseroute.backend.repository.EmergencyCaseRepository;
import com.pulseroute.backend.repository.AmbulanceRepository;
import com.pulseroute.backend.dto.EmergencyCaseDTO;
import com.pulseroute.backend.dto.CreateEmergencyRequest;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Arrays;
import java.util.Random;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class EmergencyService {
    @Autowired
    private EmergencyCaseRepository repository;
    
    @Autowired
    private AmbulanceRepository ambulanceRepository;

    private EmergencyCaseDTO mapToDTO(EmergencyCase e) {
        EmergencyCaseDTO dto = new EmergencyCaseDTO();
        dto.id = e.getId();
        dto.caseNumber = e.getCaseNumber();
        dto.callerName = e.getCallerName();
        dto.callerPhone = e.getCallerPhone();
        dto.patientName = e.getPatientName();
        dto.emergencyType = e.getEmergencyType();
        dto.severity = e.getSeverity();
        dto.incidentAddress = e.getIncidentAddress();
        dto.latitude = e.getLatitude();
        dto.longitude = e.getLongitude();
        dto.notes = e.getNotes();
        dto.assignedAmbulanceId = e.getAssignedAmbulanceId();
        dto.status = e.getStatus();
        dto.createdAt = e.getCreatedAt();
        dto.updatedAt = e.getUpdatedAt();
        return dto;
    }

    public EmergencyCaseDTO createEmergency(CreateEmergencyRequest req) {
        EmergencyCase c = new EmergencyCase();
        c.setCaseNumber("ER-" + java.time.Year.now().getValue() + "-" + (10000 + new Random().nextInt(90000)));
        c.setCallerName(req.callerName);
        c.setCallerPhone(req.callerPhone);
        c.setPatientName(req.patientName);
        c.setEmergencyType(req.emergencyType);
        c.setSeverity(req.severity);
        c.setIncidentAddress(req.incidentAddress);
        c.setLatitude(req.latitude);
        c.setLongitude(req.longitude);
        c.setNotes(req.notes);
        c.setStatus(EmergencyStatus.CREATED);
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        
        EmergencyCase saved = repository.save(c);
        return mapToDTO(saved);
    }

    public List<EmergencyCaseDTO> getAll() {
        return repository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public EmergencyCaseDTO getById(Long id) {
        return repository.findById(id).map(this::mapToDTO).orElse(null);
    }

    public List<EmergencyCaseDTO> getActive() {
        return repository.findByStatusNot(EmergencyStatus.COMPLETED).stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    
    public List<EmergencyCaseDTO> getActiveForAmbulanceCode(String code) {
        Ambulance amb = ambulanceRepository.findByAmbulanceCode(code);
        if (amb == null) return List.of();
        List<EmergencyStatus> statuses = Arrays.asList(EmergencyStatus.DISPATCHED, EmergencyStatus.ACCEPTED, EmergencyStatus.EN_ROUTE, EmergencyStatus.ARRIVED, EmergencyStatus.PATIENT_ONBOARD, EmergencyStatus.HOSPITAL_SELECTED, EmergencyStatus.EN_ROUTE_TO_HOSPITAL);
        return repository.findByAssignedAmbulanceIdAndStatusIn(amb.getId(), statuses).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public void dispatch(Long id) {
        EmergencyCase c = repository.findById(id).orElseThrow();
        // Just mock dispatching for now to AMB-1042
        Ambulance amb = ambulanceRepository.findByAmbulanceCode("AMB-1042");
        if(amb != null) {
            c.setAssignedAmbulanceId(amb.getId());
            c.setStatus(EmergencyStatus.DISPATCHED);
            c.setUpdatedAt(LocalDateTime.now());
            repository.save(c);
        }
    }
    
    public void acceptByCaseNumber(String caseNumber) {
        EmergencyCase c = repository.findByCaseNumber(caseNumber);
        if (c != null) {
            c.setStatus(EmergencyStatus.ACCEPTED);
            c.setUpdatedAt(LocalDateTime.now());
            repository.save(c);
        }
    }

    public void declineByCaseNumber(String caseNumber) {
        EmergencyCase c = repository.findByCaseNumber(caseNumber);
        if (c != null) {
            c.setStatus(EmergencyStatus.CANCELLED);
            c.setUpdatedAt(LocalDateTime.now());
            repository.save(c);
        }
    }

    public void accept(Long id) {
        EmergencyCase c = repository.findById(id).orElseThrow();
        c.setStatus(EmergencyStatus.ACCEPTED);
        c.setUpdatedAt(LocalDateTime.now());
        repository.save(c);
    }
    
    public void arrive(Long id) {
        EmergencyCase c = repository.findById(id).orElseThrow();
        c.setStatus(EmergencyStatus.ARRIVED);
        c.setUpdatedAt(LocalDateTime.now());
        repository.save(c);
    }
}
