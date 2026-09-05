package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateClinicalSessionRequest;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.models.Patient;
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

    ClinicalSession getClinicalSessionById(String id){
        return clinicalSessionRepo.findById(id).orElseThrow(() -> new RuntimeException("Invalid id of clinical seasson"));
    }

    ClinicalSession getClinicalSeassionByIdAndPatient(String id, Patient patient){
        return clinicalSessionRepo.findByIdAndPatient(id,patient).orElseThrow(() -> new RuntimeException("Either the sdeassion does not exist or You dont have permition to access it"));
    }
}
