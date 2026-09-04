package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateClinicalSessionRequest;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.repos.ClinicalSessionRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class ClinicalSessionService {

    private final ClinicalSessionRepo clinicalSessionRepo;
    private final RandomIdGenerater randomIdGenerater;

    public ClinicalSessionService(ClinicalSessionRepo clinicalSessionRepo, RandomIdGenerater randomIdGenerater) {
        this.clinicalSessionRepo = clinicalSessionRepo;
        this.randomIdGenerater = randomIdGenerater;
    }

    ClinicalSession createSession(){
        ClinicalSession clinicalSession = new ClinicalSession();
        clinicalSession.setId(randomIdGenerater.generate());
        clinicalSessionRepo.save(clinicalSession);
        return clinicalSession;
    }
}
