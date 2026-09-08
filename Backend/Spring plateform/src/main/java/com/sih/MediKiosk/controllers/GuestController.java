package com.sih.MediKiosk.controllers;

import com.sih.MediKiosk.dtos.requestDtos.GuestLoginRequest;
import com.sih.MediKiosk.dtos.responseDtos.GuestLoginResponse;
import com.sih.MediKiosk.services.GuestService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/guest")
@Slf4j
public class GuestController {

    private final GuestService guestService;

    public GuestController(GuestService guestService) {
        this.guestService = guestService;
    }

    @PostMapping("/login")
    public ResponseEntity<GuestLoginResponse> login(@RequestBody GuestLoginRequest request) {
        log.info("Registration number = {}", request.getRegistrationNumber());
        return guestService.guestLogin(request);
    }
}
