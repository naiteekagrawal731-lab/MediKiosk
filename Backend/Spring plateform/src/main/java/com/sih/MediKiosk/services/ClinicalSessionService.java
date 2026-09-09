package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateClinicalSessionRequest;
import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionSummaryDto;
import com.sih.MediKiosk.dtos.responseDtos.DjangoClinicalSessionResponse;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.models.Guest;
import com.sih.MediKiosk.models.Patient;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.ClinicalSessionRepo;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

@Service
@Slf4j 
public class ClinicalSessionService {

    private final ClinicalSessionRepo clinicalSessionRepo;
    private final RandomIdGenerater randomIdGenerater;
    private final DjangoClient djangoClient;

    public ClinicalSessionService(ClinicalSessionRepo clinicalSessionRepo, RandomIdGenerater randomIdGenerater, DjangoClient djangoClient) {
        this.clinicalSessionRepo = clinicalSessionRepo;
        this.randomIdGenerater = randomIdGenerater;
        this.djangoClient = djangoClient;
    }

    ClinicalSession createSession(Patient patient){
        ClinicalSession clinicalSession = new ClinicalSession();
        clinicalSession.setId(randomIdGenerater.generate());
        clinicalSession.setPatient(patient);
        clinicalSessionRepo.save(clinicalSession);
        return clinicalSession;
    }
    ClinicalSession crateSession(Guest guest){
        ClinicalSession clinicalSession = new ClinicalSession();
        clinicalSession.setId(randomIdGenerater.generate());
        clinicalSession.setGuest(guest);
        guest.setClinicalSession(clinicalSession);
        clinicalSessionRepo.save(clinicalSession);
        return clinicalSession;
    }




    DjangoClinicalSessionResponse getClinicalSessionById(String id){
        ClinicalSession clinicalSession = clinicalSessionRepo.findById(id).orElseThrow(() -> new RuntimeException("Invalid clinical session id"));
        DjangoClinicalSessionResponse djangoClinicalSessionResponse =djangoClient.getClinicalSession(id).block();
        ClinicalSessionSummaryDto clinicalSessionSummaryDto = djangoClinicalSessionResponse.getSummaryData();
        log.info(clinicalSessionSummaryDto.toString());
        if(clinicalSession.getGuest() != null){
            Guest guest = clinicalSession.getGuest();
            clinicalSessionSummaryDto.setPatientName(guest.getName());
            clinicalSessionSummaryDto.setDateOfBirth(guest.getDateOfBirth());
            clinicalSessionSummaryDto.setPhoneNumber(guest.getPhoneNumber());
            clinicalSessionSummaryDto.setBloodGroup(guest.getBloodGroup());
            return djangoClinicalSessionResponse;

        }else{
            Patient patient = clinicalSession.getPatient();
            clinicalSessionSummaryDto.setPatientName(patient.getUser().getUsername());
            clinicalSessionSummaryDto.setDateOfBirth(patient.getDateOfBirth());
            clinicalSessionSummaryDto.setPhoneNumber(patient.getPhoneNumber());
            clinicalSessionSummaryDto.setBloodGroup(patient.getBloodGroup());
            return djangoClinicalSessionResponse;
        }

    }

    DjangoClinicalSessionResponse getClinicalSeassionByIdAndPatient(String id, Patient patient){
        ClinicalSession clinicalSession = clinicalSessionRepo.findById(id).orElseThrow(() -> new RuntimeException("Invalid clinical session id"));
        DjangoClinicalSessionResponse djangoClinicalSessionResponse =djangoClient.getClinicalSession(id).block();
        ClinicalSessionSummaryDto clinicalSessionSummaryDto = djangoClinicalSessionResponse.getSummaryData();
        clinicalSessionSummaryDto.setPatientName(patient.getUser().getUsername());
        clinicalSessionSummaryDto.setDateOfBirth(patient.getDateOfBirth());
        clinicalSessionSummaryDto.setPhoneNumber(patient.getPhoneNumber());
        clinicalSessionSummaryDto.setBloodGroup(patient.getBloodGroup());
        return djangoClinicalSessionResponse;
    }
}
