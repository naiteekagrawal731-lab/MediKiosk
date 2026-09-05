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
    SELECT COUNT(h) > 0
    FROM Hospital h
    JOIN h.patients p
    JOIN ClinicalSession cs ON cs.patient = p
    WHERE h.id = :hospitalId
      AND cs.id = :sessionId
""")
    boolean hasPatientSessionAccess(
            @Param("hospitalId") UUID hospitalId,
            @Param("sessionId") String sessionId
    );

    @Query("""
    SELECT COUNT(h) > 0
    FROM Hospital h
    JOIN h.guests g
    JOIN ClinicalSession cs ON cs.guest = g
    WHERE h.id = :hospitalId
      AND cs.id = :sessionId
""")
    boolean hasGuestSessionAccess(
            @Param("hospitalId") UUID hospitalId,
            @Param("sessionId") String sessionId
    );
}