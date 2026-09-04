package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreateHospitalRequest;
import com.sih.MediKiosk.dtos.responseDtos.RegistrationNumberResponse;
import com.sih.MediKiosk.services.HospitalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hospital")
@Slf4j
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewHosptial(@RequestBody CreateHospitalRequest request) {
        log.info("Hospital creation request = "+request.toString());
        return hospitalService.createNewHospital(request);
    }

    @GetMapping("/registrationNumber")
    public ResponseEntity<RegistrationNumberResponse> getRegistrationNumber() {
        return hospitalService.getRegistrationNumber();
    }


}
