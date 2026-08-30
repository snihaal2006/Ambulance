package com.pulseroute.backend.dto;

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
