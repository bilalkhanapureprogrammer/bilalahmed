package com.smartcity.repository;
import com.smartcity.entity.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {
    List<TransportRoute> findByStatus(TransportRoute.BusStatus status);
    java.util.Optional<TransportRoute> findByBusId(String busId);
}