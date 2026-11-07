package com.smartcity.controller;

import com.smartcity.dto.RechargeRequest;
import com.smartcity.entity.*;
import com.smartcity.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/electricity")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ElectricityController {

    private final UserRepository userRepo;
    private final ElectricityGridRepository gridRepo;
    private final RechargeTransactionRepository txnRepo;

    // GET all grid zone statuses
    @GetMapping("/grid")
    public List<ElectricityGrid> getGridStatus() {
        return gridRepo.findAll();
    }

    // GET single ward status
    @GetMapping("/grid/{wardId}")
    public ResponseEntity<ElectricityGrid> getWardStatus(@PathVariable String wardId) {
        return gridRepo.findByWardId(wardId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // PUT update grid status (Official only)
    @PutMapping("/grid/{wardId}/status")
    public ResponseEntity<ElectricityGrid> updateGridStatus(
            @PathVariable String wardId,
            @RequestParam String status,
            @RequestParam(required = false) String reason) {
        return gridRepo.findByWardId(wardId).map(g -> {
            g.setStatus(ElectricityGrid.GridStatus.valueOf(status));
            if (reason != null) g.setReason(reason);
            return ResponseEntity.ok(gridRepo.save(g));
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET consumer dashboard (balance + history)
    @GetMapping("/consumer/{userId}")
    public ResponseEntity<Map<String, Object>> getConsumerDashboard(@PathVariable Long userId) {
        return userRepo.findById(userId).map(user -> {
            List<RechargeTransaction> history = txnRepo.findByUserIdOrderByCreatedAtDesc(userId);
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("consumerId", user.getConsumerId());
            resp.put("name", user.getFullName());
            resp.put("balance", user.getBalance());
            resp.put("wardId", user.getWardId());
            resp.put("rechargeHistory", history);
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }

    // POST recharge prepaid meter
    @PostMapping("/recharge/{userId}")
    @Transactional
    public ResponseEntity<?> recharge(
            @PathVariable Long userId,
            @RequestBody RechargeRequest req) {
        return userRepo.findById(userId).map(user -> {
            // Null check + Minimum amount check
            if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.TEN) < 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Minimum recharge is ₹10"));
            }

            BigDecimal newBalance = user.getBalance().add(req.getAmount());
            user.setBalance(newBalance);
            userRepo.save(user);

            // This part requires Lombok to be working for .builder()
            RechargeTransaction txn = RechargeTransaction.builder()
                .user(user)
                .amount(req.getAmount())
                .txnRef("TXN" + System.currentTimeMillis())
                .method(RechargeTransaction.Method.valueOf(req.getMethod()))
                .status(RechargeTransaction.TxnStatus.SUCCESS)
                .balanceAfter(newBalance)
                .createdAt(LocalDateTime.now())
                .build();
            txnRepo.save(txn);

            // Use a standard HashMap to avoid Map.of type inference issues
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("newBalance", newBalance);
            response.put("txnRef", txn.getTxnRef());
            response.put("message", "Recharge of ₹" + req.getAmount() + " successful");

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}