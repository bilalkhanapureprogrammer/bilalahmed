package com.smartcity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "electricity_grid")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ElectricityGrid {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ward_id", nullable = false, unique = true, length = 20)
    private String wardId;

    @Column(name = "ward_name", nullable = false, length = 100)
    private String wardName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GridStatus status = GridStatus.online;

    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;

    @Column(name = "restoration_time")
    private LocalDateTime restorationTime;

    @Column(length = 200)
    private String reason;

    @Column(name = "consumers_affected")
    private Integer consumersAffected = 0;

    @Column(name = "grid_officer", length = 100)
    private String gridOfficer;

    public enum GridStatus { online, maintenance, outage }
}