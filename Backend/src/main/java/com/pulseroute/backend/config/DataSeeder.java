package com.pulseroute.backend.config;

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
