package com.pulseroute.backend.controller;

import com.pulseroute.backend.dto.AmbulanceDTO;
import com.pulseroute.backend.service.AmbulanceService;
import com.pulseroute.backend.entity.AmbulanceStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

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

    @PostMapping("/{code}/status")
    public void setStatus(@PathVariable String code, @RequestBody Map<String, String> body) {
        service.updateStatus(code, AmbulanceStatus.valueOf(body.get("status")));
    }
}
