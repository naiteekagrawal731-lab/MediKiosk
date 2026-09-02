package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.RegistrationRequest;
import com.sih.MediKiosk.dtos.responseDtos.RegistrationResponse;
import com.sih.MediKiosk.services.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/register")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegistrationRequest request) {
        return registrationService.register(request);
    }
}
