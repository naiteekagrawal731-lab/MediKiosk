package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreatePatientRequest;
import com.sih.MediKiosk.dtos.requestDtos.PatientLoginRequest;
import com.sih.MediKiosk.services.PatientService;
import com.sih.MediKiosk.services.UsernamePasswordLoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patient")
public class PatientController {
    private final PatientService patientService;
    private final UsernamePasswordLoginService usernamePasswordLoginService;

    public PatientController(PatientService patientService, UsernamePasswordLoginService usernamePasswordLoginService) {
        this.patientService = patientService;
        this.usernamePasswordLoginService = usernamePasswordLoginService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewPatient(@RequestBody CreatePatientRequest request){
        return patientService.createNewPatient(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody PatientLoginRequest request){
        return usernamePasswordLoginService.login(request);
    }
}
