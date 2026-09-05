package com.sih.MediKiosk.services;

import com.sih.MediKiosk.dtos.requestDtos.CreateDoctorRequest;
import com.sih.MediKiosk.dtos.requestDtos.RegistrationRequest;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.models.Doctor;
import com.sih.MediKiosk.models.Hospital;
import com.sih.MediKiosk.models.User;
import com.sih.MediKiosk.repos.DoctorRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import javax.print.Doc;

@Service
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
    public ResponseEntity<?> createDoctor(CreateDoctorRequest request){
        String hospitalName = SecurityContextHolder.getContext().getAuthentication().getName();
        registrationService.register(RegistrationRequest.builder()
                        .username(request.getUsername())
                        .password(request.getPassword())
                .build());
        User user = userService.getUserByUsername(request.getUsername()).orElseThrow(() -> new RuntimeException("Doctor with username = "+request.getUsername()+" does not exist"));
        Doctor doctor = Doctor.builder()
                .user(user)
                .hospital(hospitalService.getHospitalFromUsername(hospitalName))
                .licenseNumber(request.getLicenseNumber())
                .qualification(request.getQualification())
                .build();

        doctorRepo.save(doctor);
        return ResponseEntity.status(201).body("Doctor id created successfully");
    }

    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ClinicalSession> getClinicalSeassion(String seassionId){
        String doctorName = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userService.getUserByUsername(doctorName).orElseThrow(() -> new RuntimeException("Doctor with username = "+doctorName+" does not exist"));
        Doctor doctor = doctorRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Not a doctor"));
        Hospital hospital = doctor.getHospital();
        if(hospitalService.hasPatientSessionAccess(hospital.getId(),seassionId) || hospitalService.hasGuestSessionAccess(hospital.getId(),seassionId)){
            //Send the clinical seassion
            return ResponseEntity.ok().body(clinicalSessionService.getClinicalSessionById(seassionId));
        }
        return ResponseEntity.status(401).build();
    }
}
