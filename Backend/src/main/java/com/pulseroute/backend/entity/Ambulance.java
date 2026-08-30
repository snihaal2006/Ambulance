package com.pulseroute.backend.entity;

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
