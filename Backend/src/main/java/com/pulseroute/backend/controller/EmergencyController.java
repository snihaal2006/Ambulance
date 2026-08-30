package com.pulseroute.backend.controller;

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

    @PostMapping("/case/{caseNumber}/accept")
    public void acceptByCaseNumber(@PathVariable String caseNumber) { service.acceptByCaseNumber(caseNumber); }

    @PostMapping("/case/{caseNumber}/decline")
    public void declineByCaseNumber(@PathVariable String caseNumber) { service.declineByCaseNumber(caseNumber); }
    
    @PostMapping("/{id}/arrive")
    public void arrive(@PathVariable Long id) { service.arrive(id); }
}
