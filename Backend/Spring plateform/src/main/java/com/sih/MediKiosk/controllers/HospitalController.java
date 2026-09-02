package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreateHospitalRequest;
import com.sih.MediKiosk.services.HospitalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/hospital")
@Slf4j
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewHosptial(CreateHospitalRequest request){
        return hospitalService.createNewHospital(request);
    }
}
