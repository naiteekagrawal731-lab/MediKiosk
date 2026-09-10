package com.sih.MediKiosk.services;


import com.sih.MediKiosk.dtos.requestDtos.LoginRequest;
import com.sih.MediKiosk.dtos.requestDtos.PatientLoginRequest;
import com.sih.MediKiosk.exceptions.UsernameNotFound;
import com.sih.MediKiosk.models.Patient;
import com.sih.MediKiosk.models.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@Slf4j
public class UsernamePasswordLoginService {

    private final UserRefreshTokenService userRefreshTokenService;
    private final UserService userService;
    private final HttpServletResponse response;
    private final PatientService patientService;
    private final HospitalService hospitalService;

    public UsernamePasswordLoginService(UserRefreshTokenService userRefreshTokenService,
                                        UserService userService,
                                        HttpServletResponse response, PatientService patientService, HospitalService hospitalService) {
        this.userRefreshTokenService = userRefreshTokenService;
        this.userService = userService;
        this.response = response;
        this.patientService = patientService;
        this.hospitalService = hospitalService;
    }

    public ResponseEntity<String> login(LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        log.info("Getting user info for: {}", username);

        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFound("User with username = " + username + " does not exist"));

        log.info("Authenticating user: {}", username);
        userService.authenticateUser(user, password);

        log.info("Generating refresh token for user: {}", username);
        UUID refreshToken = userRefreshTokenService.generateRefreshToken(user);

        org.springframework.http.ResponseCookie refreshTokenCookie = org.springframework.http.ResponseCookie
                .from("refresh_token", String.valueOf(refreshToken))
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(3600 * 24 * 30)
                .sameSite("Lax")
                .build();

        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        log.info("Login successful for user: {}", username);
        return ResponseEntity.ok("Login Successful");

    }
    public ResponseEntity<String> login(PatientLoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        log.info("Getting user info for: {}", username);

        User user = userService.getUserByUsername(username)
                .orElseThrow(() -> new UsernameNotFound("User with username = " + username + " does not exist"));

        log.info("Authenticating user: {}", username);
        userService.authenticateUser(user, password);

        log.info("Generating refresh token for user: {}", username);
        UUID refreshToken = userRefreshTokenService.generateRefreshToken(user);

        ResponseCookie cookie = ResponseCookie.from("refresh_token", String.valueOf(refreshToken))
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ofDays(30))
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        if(!loginRequest.getRegistrationNumber().equals(null)){
            Patient patient = patientService.getPatientByUser(user);
            hospitalService.addUserToHospitalPermission(UUID.fromString(loginRequest.getRegistrationNumber()),patient);
        }

        log.info("Login successful for user: {}", username);
        return ResponseEntity.ok("Login Successful");

    }
}
