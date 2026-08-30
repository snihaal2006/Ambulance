import os

base_dir = "src/main/java/com/pulseroute/backend"

files = {
    "entity/AmbulanceStatus.java": """package com.pulseroute.backend.entity;

public enum AmbulanceStatus {
    AVAILABLE, ASSIGNED, EN_ROUTE_TO_PATIENT, AT_SCENE, PATIENT_ONBOARD, EN_ROUTE_TO_HOSPITAL, AT_HOSPITAL, OFF_DUTY
}
""",
    "entity/EmergencyStatus.java": """package com.pulseroute.backend.entity;

public enum EmergencyStatus {
    CREATED, DISPATCHED, ACCEPTED, EN_ROUTE, ARRIVED, PATIENT_ONBOARD, HOSPITAL_SELECTED, EN_ROUTE_TO_HOSPITAL, COMPLETED, CANCELLED
}
""",
    "entity/Ambulance.java": """package com.pulseroute.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Ambulance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String ambulanceCode;
    private String driverName;
    private String registrationNumber;
    private Double latitude;
    private Double longitude;
    
    @Enumerated(EnumType.STRING)
    private AmbulanceStatus status;
    private LocalDateTime lastUpdated;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this. id = id; }
    public String getAmbulanceCode() { return ambulanceCode; }
    public void setAmbulanceCode(String ambulanceCode) { this.ambulanceCode = ambulanceCode; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public AmbulanceStatus getStatus() { return status; }
    public void setStatus(AmbulanceStatus status) { this.status = status; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
""",
    "entity/EmergencyCase.java": """package com.pulseroute.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class EmergencyCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String caseNumber;
    private String callerName;
    private String callerPhone;
    private String patientName;
    private String emergencyType;
    private String severity;
    private String incidentAddress;
    private Double latitude;
    private Double longitude;
    private String notes;
    private Long assignedAmbulanceId;
    
    @Enumerated(EnumType.STRING)
    private EmergencyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }
    public String getCallerName() { return callerName; }
    public void setCallerName(String callerName) { this.callerName = callerName; }
    public String getCallerPhone() { return callerPhone; }
    public void setCallerPhone(String callerPhone) { this.callerPhone = callerPhone; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getIncidentAddress() { return incidentAddress; }
    public void setIncidentAddress(String incidentAddress) { this.incidentAddress = incidentAddress; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getAssignedAmbulanceId() { return assignedAmbulanceId; }
    public void setAssignedAmbulanceId(Long assignedAmbulanceId) { this.assignedAmbulanceId = assignedAmbulanceId; }
    public EmergencyStatus getStatus() { return status; }
    public void setStatus(EmergencyStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
""",
    "repository/AmbulanceRepository.java": """package com.pulseroute.backend.repository;

import com.pulseroute.backend.entity.Ambulance;
import com.pulseroute.backend.entity.AmbulanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AmbulanceRepository extends JpaRepository<Ambulance, Long> {
    List<Ambulance> findByStatus(AmbulanceStatus status);
    Ambulance findByAmbulanceCode(String code);
}
""",
    "repository/EmergencyCaseRepository.java": """package com.pulseroute.backend.repository;

import com.pulseroute.backend.entity.EmergencyCase;
import com.pulseroute.backend.entity.EmergencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmergencyCaseRepository extends JpaRepository<EmergencyCase, Long> {
    List<EmergencyCase> findByStatusNot(EmergencyStatus status);
    List<EmergencyCase> findByAssignedAmbulanceIdAndStatusIn(Long ambulanceId, List<EmergencyStatus> statuses);
}
""",
    "dto/AmbulanceDTO.java": """package com.pulseroute.backend.dto;

import com.pulseroute.backend.entity.AmbulanceStatus;
import java.time.LocalDateTime;

public class AmbulanceDTO {
    public Long id;
    public String ambulanceCode;
    public String driverName;
    public String registrationNumber;
    public Double latitude;
    public Double longitude;
    public AmbulanceStatus status;
    public LocalDateTime lastUpdated;
}
""",
    "dto/EmergencyCaseDTO.java": """package com.pulseroute.backend.dto;

import com.pulseroute.backend.entity.EmergencyStatus;
import java.time.LocalDateTime;

public class EmergencyCaseDTO {
    public Long id;
    public String caseNumber;
    public String callerName;
    public String callerPhone;
    public String patientName;
    public String emergencyType;
    public String severity;
    public String incidentAddress;
    public Double latitude;
    public Double longitude;
    public String notes;
    public Long assignedAmbulanceId;
    public EmergencyStatus status;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
""",
    "dto/CreateEmergencyRequest.java": """package com.pulseroute.backend.dto;

public class CreateEmergencyRequest {
    public String callerName;
    public String callerPhone;
    public String patientName;
    public String emergencyType;
    public String severity;
    public String incidentAddress;
    public Double latitude;
    public Double longitude;
    public String notes;
}
""",
    "service/AmbulanceService.java": """package com.pulseroute.backend.service;

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
    
    public List<AmbulanceDTO> getAvailable() {
        return repository.findByStatus(AmbulanceStatus.AVAILABLE).stream().map(this::mapToDTO).collect(Collectors.toList());
    }
}
""",
    "service/EmergencyService.java": """package com.pulseroute.backend.service;

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
""",
    "controller/AmbulanceController.java": """package com.pulseroute.backend.controller;

import com.pulseroute.backend.dto.AmbulanceDTO;
import com.pulseroute.backend.service.AmbulanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ambulances")
public class AmbulanceController {
    @Autowired
    private AmbulanceService service;

    @GetMapping
    public List<AmbulanceDTO> getAll() { return service.getAll(); }

    @GetMapping("/{id}")
    public AmbulanceDTO getById(@PathVariable Long id) { return service.getById(id); }

    @GetMapping("/available")
    public List<AmbulanceDTO> getAvailable() { return service.getAvailable(); }
}
""",
    "controller/EmergencyController.java": """package com.pulseroute.backend.controller;

import com.pulseroute.backend.dto.EmergencyCaseDTO;
import com.pulseroute.backend.dto.CreateEmergencyRequest;
import com.pulseroute.backend.service.EmergencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergencies")
public class EmergencyController {
    @Autowired
    private EmergencyService service;

    @PostMapping
    public EmergencyCaseDTO create(@RequestBody CreateEmergencyRequest req) {
        return service.createEmergency(req);
    }

    @GetMapping
    public List<EmergencyCaseDTO> getAll() { return service.getAll(); }
    
    @GetMapping("/active")
    public List<EmergencyCaseDTO> getActive(@RequestParam(required = false) String ambulanceCode) { 
        if (ambulanceCode != null) {
            return service.getActiveForAmbulanceCode(ambulanceCode);
        }
        return service.getActive(); 
    }

    @GetMapping("/{id}")
    public EmergencyCaseDTO getById(@PathVariable Long id) { return service.getById(id); }

    @PostMapping("/{id}/dispatch")
    public void dispatch(@PathVariable Long id) { service.dispatch(id); }
    
    @PostMapping("/{id}/accept")
    public void accept(@PathVariable Long id) { service.accept(id); }
    
    @PostMapping("/{id}/arrive")
    public void arrive(@PathVariable Long id) { service.arrive(id); }
}
""",
    "config/WebConfig.java": """package com.pulseroute.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("*")
                .allowedHeaders("*");
    }
}
""",
    "config/DataSeeder.java": """package com.pulseroute.backend.config;

import com.pulseroute.backend.entity.Ambulance;
import com.pulseroute.backend.entity.AmbulanceStatus;
import com.pulseroute.backend.repository.AmbulanceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private AmbulanceRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if(repository.count() == 0) {
            Ambulance a1 = new Ambulance();
            a1.setAmbulanceCode("AMB-1042");
            a1.setDriverName("Arun Kumar");
            a1.setStatus(AmbulanceStatus.AVAILABLE);
            a1.setLatitude(11.0264);
            a1.setLongitude(76.9455);
            a1.setLastUpdated(LocalDateTime.now());
            
            Ambulance a2 = new Ambulance();
            a2.setAmbulanceCode("AMB-1018");
            a2.setDriverName("Rahul Kumar");
            a2.setStatus(AmbulanceStatus.AVAILABLE);
            a2.setLatitude(11.0250);
            a2.setLongitude(76.9500);
            a2.setLastUpdated(LocalDateTime.now());
            
            Ambulance a3 = new Ambulance();
            a3.setAmbulanceCode("AMB-1077");
            a3.setDriverName("Suresh Kumar");
            a3.setStatus(AmbulanceStatus.OFF_DUTY);
            a3.setLatitude(11.0300);
            a3.setLongitude(76.9400);
            a3.setLastUpdated(LocalDateTime.now());
            
            repository.save(a1);
            repository.save(a2);
            repository.save(a3);
        }
    }
}
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
