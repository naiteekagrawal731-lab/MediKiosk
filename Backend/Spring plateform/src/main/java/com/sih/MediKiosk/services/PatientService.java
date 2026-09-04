package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreatePatientRequest;
import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.models.Patient;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.PatientRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.*;

@Service
public class PatientService {

    private final PatientRepo patientRepo;
    private final  RegistrationService registrationService;
    private final UserService userService;

    public PatientService(PatientRepo patientRepo, RegistrationService registrationService, UserService userService) {
        this.patientRepo = patientRepo;
        this.registrationService = registrationService;
        this.userService = userService;
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
}
