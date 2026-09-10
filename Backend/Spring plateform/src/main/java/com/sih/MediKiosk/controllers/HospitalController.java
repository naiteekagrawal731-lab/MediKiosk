package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreateHospitalRequest;
import com.sih.MediKiosk.dtos.requestDtos.LoginRequest;
import com.sih.MediKiosk.dtos.responseDtos.LoginResponse;
import com.sih.MediKiosk.dtos.responseDtos.RegistrationNumberResponse;
import com.sih.MediKiosk.services.HospitalService;
import com.sih.MediKiosk.services.UsernamePasswordLoginService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hospital")
@Slf4j
public class HospitalController {

    private final HospitalService hospitalService;
    private final UsernamePasswordLoginService usernamePasswordLoginService;
    private final LogoutController logoutController;

    public HospitalController(HospitalService hospitalService, UsernamePasswordLoginService usernamePasswordLoginService, LogoutController logoutController) {
        this.hospitalService = hospitalService;
        this.usernamePasswordLoginService = usernamePasswordLoginService;
        this.logoutController = logoutController;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createNewHosptial(@RequestBody CreateHospitalRequest request) {
        log.info("Hospital creation request = "+request.toString());
        return hospitalService.createNewHospital(request);
    }
    @PostMapping ("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request){
        return usernamePasswordLoginService.login(request);
    }

    @GetMapping("/registrationNumber")
    public ResponseEntity<RegistrationNumberResponse> getRegistrationNumber(HttpServletRequest request, HttpServletResponse response) {
        ResponseEntity<RegistrationNumberResponse> registrationNumberResponse = hospitalService.getRegistrationNumber();
        logoutController.logout(response,request);
        return registrationNumberResponse;
    }

}
