package com.smartcity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "transport_routes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TransportRoute {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_id", nullable = false, unique = true, length = 20)
    private String busId;

    @Column(name = "route_name", nullable = false, length = 150)
    private String routeName;

    @Column(name = "route_number", length = 20)
    private String routeNumber;

    @Column(name = "current_lat", precision = 9, scale = 6)
    private BigDecimal currentLat;

    @Column(name = "current_lng", precision = 9, scale = 6)
    private BigDecimal currentLng;

    @Column(name = "speed_kmh")
    private Integer speedKmh = 0;

    @Column(name = "next_arrival_min")
    private Integer nextArrivalMin = 0;

    @Column(name = "seats_available")
    private Integer seatsAvailable = 0;

    @Column(name = "total_seats")
    private Integer totalSeats = 50;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusStatus status = BusStatus.ACTIVE;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public enum BusStatus { ACTIVE, DEPOT, BREAKDOWN }
}