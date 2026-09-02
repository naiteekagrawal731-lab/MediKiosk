package com.sih.MediKiosk.controllers;


import com.sih.MediKiosk.services.LogoutService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logout")
public class LogoutController {

    private final LogoutService logoutService;

    public LogoutController(LogoutService logoutService) {
        this.logoutService = logoutService;
    }

    @PostMapping
    public ResponseEntity<String> logout(HttpServletResponse response, HttpServletRequest request) {
        return logoutService.logout(response, request);
    }
}
