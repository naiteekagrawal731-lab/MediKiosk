package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreatePatientRequest;
import com.sih.MediKiosk.dtos.requestDtos.GetSessionRequest;
import com.sih.MediKiosk.dtos.requestDtos.PatientLoginRequest;
import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionDto;
import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionSummaryDto;
import com.sih.MediKiosk.dtos.responseDtos.CreateSessionResponse;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.services.PatientService;
import com.sih.MediKiosk.services.UsernamePasswordLoginService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        ResponseEntity<String> response = patientService.createNewPatient(request);
        return response;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody PatientLoginRequest request){
        return usernamePasswordLoginService.login(request);
    }

    @GetMapping("/clinicalsession")
    public ResponseEntity<ClinicalSessionSummaryDto> getClinicalSeasssion(@RequestBody GetSessionRequest request){
        return patientService.getClinicalSeassion(request);
    }

    @GetMapping("/multipleclinicalsession")
    public ResponseEntity<List<ClinicalSessionDto>> getMultipleClinicalSession(){
        return patientService.getMultipleClinicalSeassion();
    }

    @PostMapping("/clinicalsession")
    public ResponseEntity<CreateSessionResponse> createSession(){
        return patientService.createSession();
    }
}
