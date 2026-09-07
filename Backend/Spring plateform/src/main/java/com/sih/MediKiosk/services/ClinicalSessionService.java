package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateClinicalSessionRequest;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.models.Guest;
import com.sih.MediKiosk.models.Patient;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.ClinicalSessionRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

@Service
public class ClinicalSessionService {

    private final ClinicalSessionRepo clinicalSessionRepo;
    private final RandomIdGenerater randomIdGenerater;
    private final DjangoClient djangoClient;

    public ClinicalSessionService(ClinicalSessionRepo clinicalSessionRepo, RandomIdGenerater randomIdGenerater, DjangoClient djangoClient) {
        this.clinicalSessionRepo = clinicalSessionRepo;
        this.randomIdGenerater = randomIdGenerater;
        this.djangoClient = djangoClient;
    }

    ClinicalSession createSession(){
        ClinicalSession clinicalSession = new ClinicalSession();
        clinicalSession.setId(randomIdGenerater.generate());
        clinicalSessionRepo.save(clinicalSession);
        return clinicalSession;
    }



    ClinicalSession getClinicalSessionById(String id){
        JsonNode
    }

    ClinicalSession getClinicalSeassionByIdAndPatient(String id, Patient patient){
        return clinicalSessionRepo.findByIdAndPatient(id,patient).orElseThrow(() -> new RuntimeException("Either the sdeassion does not exist or You dont have permition to access it"));
    }
}
