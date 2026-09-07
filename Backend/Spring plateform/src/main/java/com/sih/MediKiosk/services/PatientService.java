package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreatePatientRequest;
import com.sih.MediKiosk.dtos.requestDtos.GetSessionRequest;
import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionSummaryDto;
import com.sih.MediKiosk.dtos.responseDtos.CreateSessionResponse;
import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.models.Patient;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.PatientRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.*;

@Service
public class PatientService {

    private final PatientRepo patientRepo;
    private final  RegistrationService registrationService;
    private final UserService userService;
    private final ClinicalSessionService clinicalSessionService;

    public PatientService(PatientRepo patientRepo, RegistrationService registrationService, UserService userService, ClinicalSessionService clinicalSessionService) {
        this.patientRepo = patientRepo;
        this.registrationService = registrationService;
        this.userService = userService;
        this.clinicalSessionService = clinicalSessionService;
    }

    @Transactional
    public ResponseEntity<?> createNewPatient(CreatePatientRequest request){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserByUsername(username).orElseThrow(() -> new UsernameNotFound("User with username = "+username+" does not exist"));

        Patient patient = Patient.builder()
                .dateOfBirth(request.getDateOfBirth())
                .phoneNumber(request.getPhoneNumber())
                .user(user)
                .bloodGroup(request.getBloodGroup())
                .gender(request.getGender())
                .build();

        patientRepo.save(patient);
        return ResponseEntity.status(201).body("Paitent id created successfully");
    }
    Patient getPatientByUser(User user){
        return patientRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Not a patient"));
    }
    @PreAuthorize("hasRole('PATIENT')")
    Patient getPatientOfUser(){
        User user = userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("Username is invalid"));
        return patientRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Not a patient"));
    }

    //When patient want to find his clinical seasion
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ClinicalSessionSummaryDto> getClinicalSeassion(GetSessionRequest request){
        Patient patient = getPatientOfUser();
        return ResponseEntity.ok().body(clinicalSessionService.getClinicalSeassionByIdAndPatient(request.getSessionId(),patient));
    }
    @Transactional
    public ResponseEntity<CreateSessionResponse> createSession(){
        User user = userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow(() -> new RuntimeException("Username is invalid"));
        Patient patient = patientRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Not a patient"));
        ClinicalSession clinicalSession = clinicalSessionService.createSession();
        clinicalSession.setPatient(patient);
        patient.getClinicalSessions().add(clinicalSession);
        patientRepo.save(patient);
        return ResponseEntity.ok().body(CreateSessionResponse.builder()
                .sessionId(clinicalSession.getId())
                .build());
    }
    //To be continue
    public ResponseEntity<ClinicalSession> getAllClinicalSession(){
        Patient patient = getPatientOfUser();
        return (ResponseEntity<ClinicalSession>) patient.getClinicalSessions();
    }

}
