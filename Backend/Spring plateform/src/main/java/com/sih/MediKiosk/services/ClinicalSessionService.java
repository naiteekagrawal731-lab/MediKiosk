package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateClinicalSessionRequest;
import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionSummaryDto;
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
        clinicalSessionRepo.flush();
        return clinicalSession;
    }



    ClinicalSessionSummaryDto getClinicalSessionById(String id){
        ClinicalSession clinicalSession = clinicalSessionRepo.findById(id).orElseThrow(() -> new RuntimeException("Invalid clinical session id"));
        ClinicalSessionSummaryDto clinicalSessionSummaryDto =djangoClient.getClinicalSession(id).block();
        if(clinicalSession.getGuest() != null){
            Guest guest = clinicalSession.getGuest();
            clinicalSessionSummaryDto.setPatientName(guest.getName());
            clinicalSessionSummaryDto.setDateOfBirth(guest.getDateOfBirth());
            clinicalSessionSummaryDto.setPhoneNumber(guest.getPhoneNumber());
            clinicalSessionSummaryDto.setBloodGroup(guest.getBloodGroup());
            return clinicalSessionSummaryDto;

        }else{
            Patient patient = clinicalSession.getPatient();
            clinicalSessionSummaryDto.setPatientName(patient.getUser().getUsername());
            clinicalSessionSummaryDto.setDateOfBirth(patient.getDateOfBirth());
            clinicalSessionSummaryDto.setPhoneNumber(patient.getPhoneNumber());
            clinicalSessionSummaryDto.setBloodGroup(patient.getBloodGroup());
            return clinicalSessionSummaryDto;
        }

    }

    ClinicalSessionSummaryDto getClinicalSeassionByIdAndPatient(String id, Patient patient){
        ClinicalSession clinicalSession = clinicalSessionRepo.findByIdAndPatient(id,patient).orElseThrow(() -> new RuntimeException("Either the sdeassion does not exist or You dont have permition to access it"));
        ClinicalSessionSummaryDto clinicalSessionSummaryDto =djangoClient.getClinicalSession(id).block();
        clinicalSessionSummaryDto.setPatientName(patient.getUser().getUsername());
        clinicalSessionSummaryDto.setDateOfBirth(patient.getDateOfBirth());
        clinicalSessionSummaryDto.setPhoneNumber(patient.getPhoneNumber());
        clinicalSessionSummaryDto.setBloodGroup(patient.getBloodGroup());
        return clinicalSessionSummaryDto;
    }
}
