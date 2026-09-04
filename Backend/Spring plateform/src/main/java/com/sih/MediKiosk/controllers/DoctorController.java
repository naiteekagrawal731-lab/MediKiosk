package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.CreateDoctorRequest;
import com.sih.MediKiosk.dtos.requestDtos.LoginRequest;
import com.sih.MediKiosk.services.DoctorService;
import com.sih.MediKiosk.services.UsernamePasswordLoginService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        return doctorService.createDoctor(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        return usernamePasswordLoginService.login(request);
    }
}
