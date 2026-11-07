package com.smartcity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "complaints")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Complaint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.Open;

    @Column(nullable = false)
    private Integer priority = 50;

    @Column(nullable = false)
    private Integer upvotes = 0;

    @Column(name = "sector_id", length = 20)
    private String sectorId;

    @Column(length = 100)
    private String department;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "result_photo_url", length = 500)
    private String resultPhotoUrl;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public enum Category { Infrastructure, Sanitation, Utilities, Electrical, Public_Safety, Transport, Environment }
    public enum Status { Open, In_Progress, Resolved }
}