package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreateHospitalRequest;
import com.sih.MediKiosk.dtos.requestDtos.LoginRequest;
import com.sih.MediKiosk.dtos.responseDtos.RegistrationNumberResponse;
import com.sih.MediKiosk.services.HospitalService;
import com.sih.MediKiosk.services.UsernamePasswordLoginService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hospital")
@Slf4j
public class HospitalController {

    private final HospitalService hospitalService;
    private final UsernamePasswordLoginService usernamePasswordLoginService;

    public HospitalController(HospitalService hospitalService, UsernamePasswordLoginService usernamePasswordLoginService) {
        this.hospitalService = hospitalService;
        this.usernamePasswordLoginService = usernamePasswordLoginService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewHosptial(@RequestBody CreateHospitalRequest request) {
        log.info("Hospital creation request = "+request.toString());
        return hospitalService.createNewHospital(request);
    }
    @GetMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        return usernamePasswordLoginService.login(request);
    }

    @GetMapping("/registrationNumber")
    public ResponseEntity<RegistrationNumberResponse> getRegistrationNumber() {
        return hospitalService.getRegistrationNumber();
    }


}
