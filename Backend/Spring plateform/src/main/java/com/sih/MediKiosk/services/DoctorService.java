package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateDoctorRequest;
import com.sih.MediKiosk.dtos.requestDtos.RegistrationRequest;
import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionSummaryDto;
import com.sih.MediKiosk.dtos.responseDtos.DjangoClinicalSessionResponse;
import com.sih.MediKiosk.models.*;
import com.sih.MediKiosk.repos.DoctorRepo;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.print.Doc;

@Service
@Slf4j 
public class DoctorService {

    private final DoctorRepo doctorRepo;
    private final RegistrationService registrationService;
    private final UserService userService;
    private final HospitalService hospitalService;
    private final ClinicalSessionService clinicalSessionService;

    public DoctorService(DoctorRepo doctorRepo, RegistrationService registrationService, UserService userService, HospitalService hospitalService, ClinicalSessionService clinicalSessionService) {
        this.doctorRepo = doctorRepo;
        this.registrationService = registrationService;
        this.userService = userService;
        this.hospitalService = hospitalService;
        this.clinicalSessionService = clinicalSessionService;
    }

    @PreAuthorize("hasRole('HOSPITAL')")
    @Transactional 
    public ResponseEntity<?> createDoctor(CreateDoctorRequest request){
        log.info("Creating new hospital with username = "+request.getUsername());
        String hospitalName = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Creating doctor for hospital = "+hospitalName);
        registrationService.register(RegistrationRequest.builder()
                        .username(request.getUsername())
                        .password(request.getPassword())
                .build(), Role.DOCTOR);
        log.info("Doctor user profile created with username = "+request.getUsername());
        User user = userService.getUserByUsername(request.getUsername()).orElseThrow(() -> new RuntimeException("Doctor with username = "+request.getUsername()+" does not exist"));
        log.info("Got the user");
        Doctor doctor = Doctor.builder()
                .user(user)
                .hospital(hospitalService.getHospitalFromUsername(hospitalName))
                .licenseNumber(request.getLicenseNumber())
                .qualification(request.getQualification())
                .build();
        log.info("Saviing doctor");
        doctorRepo.save(doctor);
        log.info("Doctor saved");
        return ResponseEntity.status(201).body("Doctor id created successfully");
    }

    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DjangoClinicalSessionResponse> getClinicalSeassion(String seassionId){
        log.info("GETTING THE SESSION SUMMARY FOR THE DOCTOR");
        String doctorName = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserByUsername(doctorName).orElseThrow(() -> new RuntimeException("Doctor with username = "+doctorName+" does not exist"));
        Doctor doctor = doctorRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Not a doctor"));
        Hospital hospital = doctor.getHospital();
        log.info("Checking whether the hospital has access to session or not");
        log.info("Has access = "+hospitalService.hasSessionAccess(hospital.getId(),seassionId));
        if(hospitalService.hasSessionAccess(hospital.getId(),seassionId)){
            //Send the clinical seassion
            log.info("Hospital has accesss");
            return ResponseEntity.ok().body(clinicalSessionService.getClinicalSessionById(seassionId));
        }
        return ResponseEntity.status(401).build();
    }
}
