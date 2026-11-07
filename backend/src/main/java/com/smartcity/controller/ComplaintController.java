package com.smartcity.controller;

import com.smartcity.entity.Complaint;
import com.smartcity.repository.ComplaintRepository;
import com.smartcity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintRepository complaintRepo;
    private final UserRepository userRepo;

    private static final Map<String, String> DEPT_MAP = Map.of(
        "Infrastructure", "PWD",
        "Sanitation", "Waste Mgmt.",
        "Utilities", "Water Board",
        "Electrical", "Electricity Board",
        "Public Safety", "Traffic Police",
        "Transport", "Transport Dept.",
        "Environment", "BBMP Green Cell"
    );

    // GET all complaints, sorted by priority desc
    @GetMapping
    public List<Complaint> getAll(@RequestParam(required = false) String status,
                                   @RequestParam(required = false) String category) {
        if (status != null)
            return complaintRepo.findByStatusOrderByPriorityDesc(Complaint.Status.valueOf(status));
        return complaintRepo.findAllByOrderByPriorityDesc();
    }

    // GET single complaint
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getById(@PathVariable Long id) {
        return complaintRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST file new complaint
    @PostMapping
    public ResponseEntity<Complaint> create(@RequestBody Complaint complaint,
                                             @RequestParam Long reporterId) {
        return userRepo.findById(reporterId).map(user -> {
            complaint.setReporter(user);
            complaint.setStatus(Complaint.Status.Open);
            complaint.setDepartment(DEPT_MAP.getOrDefault(complaint.getCategory().name(), "General"));
            Complaint saved = complaintRepo.save(complaint);
            // Award civic points
            user.setCivicPoints(user.getCivicPoints() + 50);
            userRepo.save(user);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.badRequest().build());
    }

    // PUT upvote a complaint
    @PutMapping("/{id}/upvote")
    @Transactional
    public ResponseEntity<String> upvote(@PathVariable Long id) {
        if (!complaintRepo.existsById(id)) return ResponseEntity.notFound().build();
        complaintRepo.upvote(id);
        return ResponseEntity.ok("Upvoted");
    }

    // PUT update status (Admin/Official only)
    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(@PathVariable Long id,
                                                    @RequestParam String status) {
        return complaintRepo.findById(id).map(c -> {
            c.setStatus(Complaint.Status.valueOf(status));
            return ResponseEntity.ok(complaintRepo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    // PUT assign department
    @PutMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignDept(@PathVariable Long id,
                                                 @RequestParam String department) {
        return complaintRepo.findById(id).map(c -> {
            c.setDepartment(department);
            if (c.getStatus() == Complaint.Status.Open)
                c.setStatus(Complaint.Status.In_Progress);
            return ResponseEntity.ok(complaintRepo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    // GET stats summary
    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        return Map.of(
            "total", complaintRepo.count(),
            "open", (long) complaintRepo.findByStatusOrderByPriorityDesc(Complaint.Status.Open).size(),
            "inProgress", (long) complaintRepo.findByStatusOrderByPriorityDesc(Complaint.Status.In_Progress).size(),
            "resolved", (long) complaintRepo.findByStatusOrderByPriorityDesc(Complaint.Status.Resolved).size()
        );
    }
}