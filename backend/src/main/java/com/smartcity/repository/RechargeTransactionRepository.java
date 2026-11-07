package com.smartcity.repository;
import com.smartcity.entity.RechargeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RechargeTransactionRepository extends JpaRepository<RechargeTransaction, Long> {
    List<RechargeTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}