package com.smartcity.repository;
import com.smartcity.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByStatusOrderByPriorityDesc(Complaint.Status status);
    List<Complaint> findByCategoryOrderByPriorityDesc(Complaint.Category category);
    List<Complaint> findAllByOrderByPriorityDesc();
    @Modifying
    @Query("UPDATE Complaint c SET c.upvotes = c.upvotes + 1, c.priority = CASE WHEN c.priority < 98 THEN c.priority + 2 ELSE 99 END WHERE c.id = :id")
    void upvote(Long id);
}