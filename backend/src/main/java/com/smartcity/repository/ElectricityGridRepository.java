package com.smartcity.repository;
import com.smartcity.entity.ElectricityGrid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ElectricityGridRepository extends JpaRepository<ElectricityGrid, Long> {
    Optional<ElectricityGrid> findByWardId(String wardId);
}