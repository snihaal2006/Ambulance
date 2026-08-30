package com.pulseroute.backend.dto;

import java.util.List;

public class HospitalDTO {
    private String id;
    private String name;
    private String shortName;
    private double lat;
    private double lng;
    private String erStatus;
    private int icuBeds;
    private List<String> capabilities;

    // getters/setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getShortName() { return shortName; }
    public void setShortName(String shortName) { this.shortName = shortName; }
    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }
    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }
    public String getErStatus() { return erStatus; }
    public void setErStatus(String erStatus) { this.erStatus = erStatus; }
    public int getIcuBeds() { return icuBeds; }
    public void setIcuBeds(int icuBeds) { this.icuBeds = icuBeds; }
    public List<String> getCapabilities() { return capabilities; }
    public void setCapabilities(List<String> capabilities) { this.capabilities = capabilities; }
}
