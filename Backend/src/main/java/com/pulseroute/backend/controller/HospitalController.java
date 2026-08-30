package com.pulseroute.backend.controller;

import com.pulseroute.backend.dto.HospitalDTO;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {
    
    private static final List<HospitalDTO> hospitals = new ArrayList<>();
    
    static {
        addHosp("hosp-ganga", "Ganga Hospital & Trauma Centre", "Ganga Hospital", 11.0280, 76.9490, "OPEN", 6, Arrays.asList("TRAUMA", "BURNS", "NEURO", "RESPIRATORY"));
        addHosp("hosp-gknm", "G. Kuppuswamy Naidu Memorial Hospital (GKNM)", "GKNM Hospital", 11.0155, 76.9745, "OPEN", 5, Arrays.asList("CARDIAC", "PEDIATRIC", "RESPIRATORY", "TRAUMA"));
        addHosp("hosp-ramakrishna", "Sri Ramakrishna Hospital", "Ramakrishna Hosp", 11.0210, 76.9780, "OPEN", 8, Arrays.asList("TRAUMA", "CARDIAC", "NEURO", "STROKE"));
        addHosp("hosp-kovaimed", "Kovai Medical Center and Hospital (KMCH)", "KMCH Main", 11.0375, 77.0250, "OPEN", 12, Arrays.asList("TRAUMA", "STROKE", "CARDIAC", "MULTISPECIALTY"));
        addHosp("hosp-psg", "PSG Hospitals", "PSG Hospitals", 11.0255, 77.0010, "OPEN", 10, Arrays.asList("TRAUMA", "PEDIATRIC", "NEURO", "MULTISPECIALTY"));
        addHosp("hosp-cbe-gh", "Coimbatore Medical College Hospital (GH)", "CBE Govt GH", 10.9985, 76.9710, "DIVERT", 0, Arrays.asList("TRAUMA", "BURNS", "INFECTIOUS", "MULTISPECIALTY"));
    }
    
    private static void addHosp(String id, String name, String shortName, double lat, double lng, String status, int beds, List<String> caps) {
        HospitalDTO h = new HospitalDTO();
        h.setId(id);
        h.setName(name);
        h.setShortName(shortName);
        h.setLat(lat);
        h.setLng(lng);
        h.setErStatus(status);
        h.setIcuBeds(beds);
        h.setCapabilities(caps);
        hospitals.add(h);
    }

    @GetMapping
    public List<HospitalDTO> getAll() {
        return hospitals;
    }
    
    @PostMapping("/{id}/status")
    public void updateStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        for (HospitalDTO h : hospitals) {
            if (h.getId().equals(id)) {
                if (body.containsKey("erStatus")) h.setErStatus(body.get("erStatus").toString());
                if (body.containsKey("icuBeds")) h.setIcuBeds(Integer.parseInt(body.get("icuBeds").toString()));
                return;
            }
        }
    }
}
