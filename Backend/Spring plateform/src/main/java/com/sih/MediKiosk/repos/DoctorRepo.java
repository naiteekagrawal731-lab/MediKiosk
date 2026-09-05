package com.sih.MediKiosk.repos;

import com.sih.MediKiosk.models.Doctor;
import com.sih.MediKiosk.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorRepo extends JpaRepository<Doctor, UUID> {

    Optional<Doctor> findByUser(User user);
}
