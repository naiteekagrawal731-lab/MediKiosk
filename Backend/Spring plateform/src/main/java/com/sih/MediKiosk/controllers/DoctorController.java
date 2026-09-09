package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreateDoctorRequest;
import com.sih.MediKiosk.dtos.requestDtos.LoginRequest;
import com.sih.MediKiosk.dtos.responseDtos.ClinicalSessionSummaryDto;
import com.sih.MediKiosk.models.ClinicalSession;
import com.sih.MediKiosk.services.DoctorService;
import com.sih.MediKiosk.services.UsernamePasswordLoginService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctor")
@Slf4j
public class DoctorController {

    private final DoctorService doctorService;
    private final UsernamePasswordLoginService usernamePasswordLoginService;


    public DoctorController(DoctorService doctorService, UsernamePasswordLoginService usernamePasswordLoginService) {
        this.doctorService = doctorService;
        this.usernamePasswordLoginService = usernamePasswordLoginService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewDoctor(@RequestBody CreateDoctorRequest request){
        log.info(request.toString()+" jarves");
        return doctorService.createDoctor(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        return usernamePasswordLoginService.login(request);
    }

    @PostMapping("/clinicalsession")
    public ResponseEntity<ClinicalSessionSummaryDto> getClinicalSession(@RequestBody String clinicalSessionId){
        return doctorService.getClinicalSeassion(clinicalSessionId);
    }


}
