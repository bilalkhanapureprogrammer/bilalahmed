package com.smartcity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "recharge_transactions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RechargeTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "txn_ref", nullable = false, unique = true, length = 50)
    private String txnRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Method method = Method.Online;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TxnStatus status = TxnStatus.SUCCESS;

    @Column(name = "balance_after", precision = 10, scale = 2)
    private BigDecimal balanceAfter;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Method { Online, UPI, Counter, Card }
    public enum TxnStatus { SUCCESS, FAILED, PENDING }
}