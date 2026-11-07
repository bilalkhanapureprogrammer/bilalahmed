package com.smartcity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.CITIZEN;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(name = "consumer_id", unique = true, length = 20)
    private String consumerId;

    @Column(name = "ward_id", length = 10)
    private String wardId;

    @Builder.Default
    @Column(name = "civic_points")
    private Integer civicPoints = 0;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "department_name", length = 100)
    private String departmentName;

    public enum Role { CITIZEN, OFFICIAL, ADMIN, DEPARTMENT }
}