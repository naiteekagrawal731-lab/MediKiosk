package com.sih.MediKiosk.repos;

import com.sih.MediKiosk.models.ClinicalSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ClinicalSessionRepo extends JpaRepository<ClinicalSession, String> {

}
