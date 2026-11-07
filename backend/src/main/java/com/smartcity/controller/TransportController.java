package com.smartcity.controller;

import com.smartcity.entity.TransportRoute;
import com.smartcity.repository.TransportRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransportController {

    private final TransportRouteRepository routeRepo;

    // GET all active bus locations (simulates live GPS)
    @GetMapping("/buses/live")
    public List<TransportRoute> getLiveBuses() {
        List<TransportRoute> buses = routeRepo.findByStatus(TransportRoute.BusStatus.ACTIVE);
        // Simulate slight movement each API call (real system uses IoT device push)
        buses.forEach(b -> {
            double dLat = (Math.random() - 0.49) * 0.0008;
            double dLng = (Math.random() - 0.49) * 0.0009;
            b.setCurrentLat(b.getCurrentLat().add(BigDecimal.valueOf(dLat)).setScale(6, RoundingMode.HALF_UP));
            b.setCurrentLng(b.getCurrentLng().add(BigDecimal.valueOf(dLng)).setScale(6, RoundingMode.HALF_UP));
            b.setNextArrivalMin(Math.max(1, b.getNextArrivalMin() + (Math.random() > 0.5 ? 1 : -1)));
            b.setLastUpdated(LocalDateTime.now());
            routeRepo.save(b);
        });
        return buses;
    }

    // GET single bus by ID
    @GetMapping("/buses/{busId}")
    public ResponseEntity<TransportRoute> getBus(@PathVariable String busId) {
        return routeRepo.findByBusId(busId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // PUT update bus location (called by onboard GPS device)
    @PutMapping("/buses/{busId}/location")
    public ResponseEntity<TransportRoute> updateLocation(
            @PathVariable String busId,
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(required = false) Integer speed) {
        return routeRepo.findByBusId(busId).map(b -> {
            b.setCurrentLat(lat);
            b.setCurrentLng(lng);
            if (speed != null) b.setSpeedKmh(speed);
            b.setLastUpdated(LocalDateTime.now());
            return ResponseEntity.ok(routeRepo.save(b));
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET all routes (schedule info)
    @GetMapping("/routes")
    public List<TransportRoute> getAllRoutes() {
        return routeRepo.findAll();
    }
}