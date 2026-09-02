package com.sih.MediKiosk.repos;

import com.sih.MediKiosk.models.Hospital;
import com.sih.MediKiosk.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalRepo extends JpaRepository<Hospital, UUID> {

    Optional<Hospital> findByUser(User user);
}
