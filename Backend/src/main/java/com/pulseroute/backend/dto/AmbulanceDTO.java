package com.pulseroute.backend.dto;

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
