package com.sih.MediKiosk.repos;

import com.sih.MediKiosk.models.Hospital;
import com.sih.MediKiosk.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalRepo extends JpaRepository<Hospital, UUID> {

    Optional<Hospital> findByUser(User user);

    Optional<Hospital> findByRegistrationNumber(UUID registrationNumber);

    @Query("""
        SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END
        FROM Hospital h
        LEFT JOIN h.patients p
        LEFT JOIN p.clinicalSessions ps
        LEFT JOIN h.guests g
        LEFT JOIN g.clinicalSession gs
        WHERE h.id = :hospitalId
        AND (ps.id = :sessionId OR gs.id = :sessionId)
    """)
    boolean hasSession(
            @Param("hospitalId") UUID hospitalId,
            @Param("sessionId") String sessionId
    );
}