package com.sih.MediKiosk.repos;

import com.sih.MediKiosk.models.Hospital;
import com.sih.MediKiosk.models.Patient;
import com.sih.MediKiosk.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepo extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByUser(User user);
}
